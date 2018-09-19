#!/usr/bin/python
# encoding: utf-8

import datetime
import copy
import mysql.connector
import itertools
import csv
import os
import sys
import numpy
import operator
import matplotlib
import matplotlib.pyplot as plt

from collections import OrderedDict
from matplotlib.ticker import MultipleLocator, FormatStrFormatter

reload(sys)
sys.setdefaultencoding('utf8')

skipEventGraphGeneration = True
skipErrorGraphGeneration = True

# MYSQL SETUP
mysqlConnection = mysql.connector.connect(host='localhost', user='username', database='password')
userIdParticipantOffset = 18
startAtUserId = 18

# MATPLOTLIB SETUP
matplotlib.rcParams['font.family'] = "serif"
matplotlib.rcParams['font.serif'] = ["Linux Libertine O Regular"]
matplotlib.rcParams['mathtext.rm'] = "Linux Libertine O Regular Italic"
matplotlib.rcParams['mathtext.it'] = "Linux Libertine O Regular Italic"
matplotlib.rcParams['text.usetex'] = True
matplotlib.rcParams['mathtext.default'] = "regular"
matplotlib.rcParams['axes.titlepad'] = 0

colourList = ["black","grey","rosybrown","red","sienna","sandybrown","tan","gold","olivedrab","chartreuse","darkgreen","mediumspringgreen","darkcyan","slategray","navy","blue","darkorchid","magenta","palevioletred"]
colourListBlack = ["black"] * 50

# DATA STORAGE
emptyHouseholdDicList = {}

studyEvents = {
    'deploy': "Deployed",
    'message_2int': "Message to arrange second interview",
    'message_2int_cancel': "Message to cancel second interview",
    '2int': 'Second interview',
    'message_3int': 'Message about third interview',
    '3int': 'Third interview',
    'inbox': "Reminder about feedback",
    "message_use": "Message to remind to use system",
    "message_passcode": "Message with iPad passcode",
    "call_help": "Call to provide assistance"
}


class Data:
    @staticmethod
    def households(households = None):
        if households is not None:
            Data._householdIds = households.keys()
            Data._households = households
            Data._events = None
            Data._scans = None

            Data._emptyDictPerHousehold = {}
            Data._emptyListPerHousehold = {}
            Data._zeroPerHousehold = {}
            Data._zeroPerHouseholdPerDay = {}
            Data._emptyGraphXYDataPerHouseholdByDay = {}
            Data._emptyGraphYDataPerHousehold = {}

            for householdId, householdData in households.iteritems():
                numDays =  households[householdId].numDays

                Data._emptyDictPerHousehold[householdId] = {}
                Data._emptyListPerHousehold[householdId] = []
                Data._zeroPerHousehold[householdId] = 0
                Data._zeroPerHouseholdPerDay[householdId] = {k: 0 for k in range(0, numDays)}
                Data._emptyGraphXYDataPerHouseholdByDay[householdId] =  GraphXYData(range(0, numDays), {})
                Data._emptyGraphYDataPerHousehold[householdId] = GraphYData([])

        return Data._households

    @staticmethod
    def householdIds():
        return Data._householdIds

    @staticmethod
    def events(events = None):
        if events is not None:
            Data._events = events
        return Data._events

    @staticmethod
    def scans(scans = None):
        if scans is not None:
            Data._scans = scans
        return Data._scans

    @staticmethod
    def predictions(predictions = None):
        if predictions is not None:
            Data._predictions = predictions
            Data.errors(Data.scans(), predictions)
        return Data._predictions

    @staticmethod
    def errors(scans = None, predictions = None):
        if scans is not None and predictions is not None:
            Data._errors = Errors(scans, predictions)
        return Data._errors

    @staticmethod
    def emptyListPerHousehold():
        return copy.deepcopy(Data._emptyListPerHousehold)

    @staticmethod
    def emptyDictPerHousehold():
        return copy.deepcopy(Data._emptyDictPerHousehold)

    @staticmethod
    def zeroPerHousehold():
        return copy.deepcopy(Data._zeroPerHousehold)

    @staticmethod
    def zeroPerHouseholdPerDay():
        return copy.deepcopy(Data._zeroPerHouseholdPerDay)

    @staticmethod
    def emptyGraphXYDataPerHouseholdByDay():
        return copy.deepcopy(Data._emptyGraphXYDataPerHouseholdByDay)

    @staticmethod
    def emptyGraphYDataPerHousehold():
        return copy.deepcopy(Data._emptyGraphYDataPerHousehold)



class GraphXYData:
    def __init__(self, x = None, y = None):
        self.x = (x or [])
        self.y = (y or [])

    def add(self, x, y):
        self.x.append(x)
        self.y.append(y)

class GraphYData:
    def __init__(self, y = None):
        self.y = (y or [])

    def add(self, y):
        self.y.append(y)

class Household:
    def __init__(self, householdId, startDate, endDate, events = {}):
        self.householdId = householdId
        self.startDate = startDate
        self.endDate = endDate
        self.numDays = (endDate - startDate).days
        self.days = OrderedDict()
        self.householdIdStr = "H%02d" % householdId
        self.householdIdTexStr = "${H_{%02d}}$" % householdId
        self.events = events

        previousDate = startDate
        for i in range(0, self.numDays+1):
            previousDate += datetime.timedelta(days=1)
            self.days[previousDate] = i

    def day(self, timestamp):
        if type(timestamp) is datetime.datetime:
            timestamp = timestamp.date()
        return (timestamp - self.startDate).days

    def __str__(self):
        return self.householdIdStr

    def tex(self):
        return self.householdIdTexStr

class Events:
    def __init__(self, rawData = None):
        self.parse(rawData)

    def parse(self, rawData = None):
        self.graphData, self.totalsByDay, self.totals, self.averageUse, self.daysBetweenEvents = self._parse(rawData or {})

    def _parse(self, rawData):
        graphData, totalsByDay, totals = self._retabulate(rawData)
        averageUse, daysBetweenEvents = self._calcAverages(totalsByDay)

        if skipEventGraphGeneration is True:
            print "Skipping event graph regeneration"
        else:
            self._generateGraphs(graphData)

        return (graphData, totalsByDay, totals, averageUse, daysBetweenEvents)

    def _retabulate(self, eventData):
        print "Retabulating event data..."
        graphData = Data.emptyGraphXYDataPerHouseholdByDay()
        totalsByDay = Data.zeroPerHouseholdPerDay()
        totals = Data.zeroPerHousehold()
        for householdId, events in eventData.iteritems():
            numDays = Data.households()[householdId].numDays
            for event in events:
                if event.day < 0 or event.day >= numDays:
                    continue

                if type(graphData[householdId].y) is list:
                    graphData[householdId].y = {}

                if event.activity not in graphData[householdId].y:
                    graphData[householdId].y[event.activity] = numpy.zeros(numDays, numpy.int8)

                graphData[householdId].y[event.activity][event.day] += 1
                totalsByDay[householdId][event.day] += 1
                totals[householdId] += 1

            print " ↳ [%s] Tabulated %d events" % (Data.households()[householdId], totals[householdId])
        return (graphData, totalsByDay, totals)

    def _calcAverages(self, totalsByDay):
        print "Recalculating average use..."
        averageUse = Data.zeroPerHousehold()
        for householdId, eventsPerDay in totalsByDay.iteritems():
            daysBetweenEvents = []
            runningDaysWithoutEvents = 0

            for day, numEvents in eventsPerDay.iteritems():
                if numEvents == 0:
                    runningDaysWithoutEvents += 1
                else:
                    daysBetweenEvents.append(runningDaysWithoutEvents)
                    runningDaysWithoutEvents = 0

            averageUse[householdId] = sum(daysBetweenEvents) / (len(daysBetweenEvents) * 1.0)
            print " ↳ [%s] Average days between events was %.2f" % (Data.households()[householdId], averageUse[householdId])

    def _generateGraphs(self, GraphXYData):
        print "Regenerating event graphs..."
        maxInteractions = 0
        assignedEventColourList = OrderedDict()
        for _, graph in GraphXYData.iteritems():
            for values in graph.y.values():
                maxInteractions = max(maxInteractions, max(values))

        for householdId, data in GraphXYData.iteritems():
            household = Data.households()[householdId]
            print " ↳ [%s] Plotting..." % (household)
            plt.clf()

            labels = []
            yData = []
            peakY = numpy.zeros(household.numDays, numpy.int8)
            for event, yPoints in data.y.iteritems():
                labels.append(event)
                yData.append(yPoints)

                for day, v in enumerate(yPoints):
                    peakY[day] += v

            orderedColors = []
            if len(assignedEventColourList) == 0:
                for i, label in enumerate(labels):
                    assignedEventColourList[label] = colourList[i]
                orderedColors = assignedEventColourList.values()
            else:
                orderedColors = []
                for i, label in enumerate(labels):
                    if label in assignedEventColourList:
                        orderedColors.append(assignedEventColourList[label])
                    else:
                        orderedColors.append(colourList[len(assignedEventColourList)])
                        assignedEventColourList[label] = colourList[len(assignedEventColourList)]

            plt.stackplot(data.x, numpy.vstack(yData), labels=labels, colors=colourList[0:len(yData)])

            for xAxis, annotation in household.events.iteritems():
                if not isinstance(annotation, basestring):
                    plt.annotate(studyEvents[annotation[0]], xy=(xAxis, peakY[xAxis]), xytext=(xAxis, peakY[xAxis] + 10), fontsize=8,
                        arrowprops=dict(facecolor='black', shrink=0.05),
                        horizontalalignment='center', verticalalignment='bottom'
                        )

                    offset = 12.5
                    for i in range(1, len(annotation)):
                        plt.text(xAxis, peakY[xAxis] + offset, studyEvents[annotation[i]], fontsize=8, horizontalalignment='center')
                        offset += 2.5

                else:
                    plt.annotate(studyEvents[annotation], xy=(xAxis, peakY[xAxis]), xytext=(xAxis, peakY[xAxis] + 10), fontsize=8,
                        arrowprops=dict(facecolor='black', shrink=0.05),
                        horizontalalignment='center', verticalalignment='bottom'
                        )

            plt.xlabel('Days since deployment', fontsize=12, fontweight='bold')
            plt.ylabel('Number of interactions', fontsize=12, fontweight='bold')

            plt.axis([0, household.numDays - 1, 0, maxInteractions + 25])

            ax = plt.gca()
            ax.set_title('%s: Interaction with Home Essentials over time' % (household), pad=10, fontsize=15, fontweight='bold')
            ax.set_facecolor('whitesmoke')

            majorLocator = MultipleLocator(10)
            majorFormatter = FormatStrFormatter('%d')
            minorLocator = MultipleLocator(1)

            ax.xaxis.set_major_locator(majorLocator)
            ax.xaxis.set_major_formatter(majorFormatter)
            ax.xaxis.set_minor_locator(minorLocator)

            ax.grid(color='white', which='major', linestyle='-', linewidth=1)
            ax.grid(color='white', which='minor', linestyle='--', linewidth=.5)

            handles, labels = ax.get_legend_handles_labels()
            hl = sorted(zip(handles, labels),
                        key=operator.itemgetter(1))
            handles2, labels2 = zip(*hl)
            ax.legend(handles2, labels2)

            fig = plt.gcf()
            fig.set_size_inches(11, 7.5)
            fig.savefig("graph-events-%s.pdf" % household, bbox_inches='tight', dpi=220)

class Event:
    def __init__(self, householdId, timestamp, activity):
        self.householdId = householdId
        self.timestamp = timestamp
        self.day = Data.households()[householdId].day(timestamp)
        self.activity = activity

class Scans:
    def __init__(self, rawData = None):
        self.parse(rawData)

    def parse(self, rawData = None):
        self.maxStock, self.itemData, self.itemDataWithCycle, self.itemDataWithCycles, self.scanInData, self.numScanIns,  self.scanOutData, self.numScanOuts, self.cycleData, self.numCycles, self.matchedScanIns, self.numMatchedScanIns = self._parse(rawData or {})

    def _parse(self, rawData):
        maxStock = 0
        itemData = Data.emptyDictPerHousehold()
        itemDataWithCycle = Data.emptyDictPerHousehold()
        itemDataWithCycles = Data.emptyDictPerHousehold()
        scanInData = Data.emptyDictPerHousehold()
        numScanIns = Data.zeroPerHousehold()
        scanOutData = Data.emptyDictPerHousehold()
        numScanOuts = Data.zeroPerHousehold()
        cycleData = Data.emptyDictPerHousehold()
        numCycles = Data.zeroPerHousehold()
        matchedScanIns = Data.emptyDictPerHousehold()
        numMatchedScanIns = Data.zeroPerHousehold()

        for householdId, scans in rawData.iteritems():
            for scan in scans:
                maxStock = max(maxStock, scan.newStock)

                if scan.item not in itemData[householdId]:
                    itemData[scan.householdId][scan.item] = []
                    scanInData[scan.householdId][scan.item] = []
                    scanOutData[scan.householdId][scan.item] = []
                    matchedScanIns[scan.householdId][scan.item] = 0
                    cycleData[scan.householdId][scan.item] = []

                itemData[scan.householdId][scan.item].append((scan.day, scan.newStock))

                if scan.action == 'in':
                    scanInData[householdId][scan.item].append((scan.timestamp, scan.deltaStock))
                    numScanIns[householdId] += 1
                elif scan.action == 'out':
                    scanOuts = len(scanOutData[householdId][scan.item])
                    scanIns = len(scanInData[householdId][scan.item])
                    
                    if scanIns > scanOuts:
                        scanInToUse = matchedScanIns[householdId][scan.item]
                        if scanInToUse < scanIns:
                            cycleTime = (scan.timestamp - [i[0] for i in scanInData[householdId][scan.item]][scanInToUse]).days
                            matchedScanIns[householdId][scan.item] += 1
                            numMatchedScanIns[householdId] += 1
                            cycleData[householdId][scan.item].append(cycleTime)
                            numCycles[householdId] += 1

                    scanOutData[householdId][scan.item].append((scan.timestamp, scan.deltaStock))
                    numScanOuts[householdId] += 1

            for item, data in itemData[householdId].iteritems():
                if len(cycleData[householdId][item]) > 0:
                    itemDataWithCycle[householdId][item] = data
                if len(cycleData[householdId][item]) > 1:
                    itemDataWithCycles[householdId][item] = data

            output = (" ↳ [%s] Across %d items, collated %d scan ins and %d scan outs, of which %d were matched" 
                % (Data.households()[householdId], len(itemData[householdId]), numScanIns[householdId],
                    numScanOuts[householdId], numMatchedScanIns[householdId]))
            output += ("\n ↳       Furthermore, %d items have one complete cycle and %d have two or more" % (
                len(itemDataWithCycle[householdId]), len(itemDataWithCycles[householdId])))
            print output

        return (maxStock, itemData, itemDataWithCycle, itemDataWithCycles, scanInData, numScanIns,  scanOutData, numScanOuts, cycleData, numCycles, matchedScanIns, numMatchedScanIns)

class Scan:
    def __init__(self, householdId, timestamp, category, product, action, oldStock, newStock, deltaStock):
        self.householdId = householdId
        self.timestamp = timestamp
        self.product = product.strip().replace('/', '-').encode("ascii","ignore")
        self.action = action
        self.oldStock = oldStock
        self.newStock = newStock
        self.deltaStock = deltaStock

        self.item = product
        if category is not None:
            self.item = category

        self.day = Data.households()[householdId].day(timestamp)

class Predictions:
    def __init__(self, rawData = None):
        self.parse(rawData)

    def parse(self, rawData = None):
        self.data, self.numPredictions = self._parse(rawData or [])

    def _parse(self, rawData):
        data = Data.emptyDictPerHousehold()
        numPredictions = Data.zeroPerHousehold()

        for householdId, predictions in rawData.iteritems():
            for prediction in predictions:
                if prediction.item not in data[householdId]:
                    data[householdId][prediction.item] = OrderedDict()

                while prediction.timestamp in data[householdId][prediction.item]:
                    prediction.timestamp += datetime.timedelta(seconds=1)

                data[householdId][prediction.item][prediction.timestamp] = prediction
                numPredictions[householdId] += 1

            output = (" ↳ [%s] Across %d items, collated %d predictions" 
                % (Data.households()[householdId], len(data[householdId]), numPredictions[householdId]))
            print output

        return (data, numPredictions)

class Prediction:
    def __init__(self, id, householdId, timestamp, category, product, lastScanIn, lastScanOut, daysTillRunOut, averageUseInDays, currentStock, daysTillNeededFromLastScanIn, dateNeeded, daysRemaining, feedback):
        self.id = id
        self.householdId = householdId
        self.timestamp = timestamp
        self.category = category
        self.product = product.strip().replace('/', '-').encode("ascii","ignore")
        self.lastScanIn = lastScanIn
        self.lastScanOut = lastScanOut
        self.daysTillRunOut = int(daysTillRunOut)
        self.averageUseInDays = int(averageUseInDays)
        self.currentStock = currentStock
        self.daysTillNeededFromLastScanIn = daysTillNeededFromLastScanIn
        self.dateNeeded = dateNeeded
        self.daysRemaining = daysRemaining
        self.feedback = feedback

        self.item = product
        if category is not None:
            self.item = category

        self.day = Data.households()[householdId].day(timestamp)
        self.useUnitBy = dateNeeded - datetime.timedelta(days=self.daysTillRunOut) + datetime.timedelta(days=self.averageUseInDays)

class Errors:
    def __init__(self, scanData = None, predictionData = None):
        self.parse(scanData, predictionData)

    def parse(self, scanData = None, predictionData = None):
        self.data, self.householdErrorGraphData = self._parse(scanData or {}, predictionData or {})

        if skipErrorGraphGeneration is True:
            print "Skipping error graph regeneration"
        else:
            self._generateHouseholdErrorGraph(self.householdErrorGraphData)

    def _parse(self, scanData, predictionData):
        data = Data.emptyDictPerHousehold()
        householdErrorGraphData = Data.emptyGraphYDataPerHousehold()

        for householdId, scans in scanData.itemDataWithCycle.iteritems():
            for item, _ in scans.iteritems():
                data[householdId][item] = []

                cycles = scanData.cycleData[householdId][item]
                scanOuts = scanData.scanOutData[householdId][item]
                predictions = predictionData.data[householdId][item]
                predictionsReverse = OrderedDict(sorted(predictions.items(), reverse=True))

                predictionIndex = 0
                cycleIndex = 1

                for index, (timestamp, _) in enumerate(scanOuts):
                    if index == 0:
                        continue

                    for day, prediction in predictionsReverse.iteritems():
                        if prediction.timestamp < timestamp:
                            break

                    errorInDays = (prediction.useUnitBy.date() - timestamp.date()).days
                    error = Error(cycles[cycleIndex], errorInDays)
                    data[householdId][item].append(error)
                    householdErrorGraphData[householdId].y.append(error.absError)

                    cycleIndex += 1

        householdErrorGraphData[1].y.append(-10)

        return (data, householdErrorGraphData)

    def _generateHouseholdErrorGraph(self, graphData):
        print "Regenerating household error graph..."

        dataLabels = []
        dataPoints = []

        for householdId, data in graphData.iteritems():
            dataLabels.append(Data.households()[householdId].tex())
            dataPoints.append(data.y)

        plt.clf()
        fig, axes = plt.subplots()
        bwPlot = plt.boxplot(dataPoints, vert=True, patch_artist=True)

        for patch, color in zip(bwPlot['boxes'], colourListBlack[0:len(dataLabels)]):
            patch.set_facecolor(color)

        plt.setp(bwPlot['medians'], color="white")

        axes.yaxis.grid(True)

        ax = plt.gca()
        ax.set_facecolor('whitesmoke')

        majorLocator = MultipleLocator(5)
        majorFormatter = FormatStrFormatter('%d')
        minorLocator = MultipleLocator(1)

        ax.yaxis.set_major_locator(majorLocator)
        ax.yaxis.set_major_formatter(majorFormatter)
        ax.yaxis.set_minor_locator(minorLocator)

        ax.grid(color='white', which='major', linestyle='-', linewidth=1)
        ax.grid(color='white', which='minor', linestyle='--', linewidth=.5)

        ax.set_xticklabels(dataLabels)

        ax.set_ylim(0, 30)

        #ax.set_title('' % (participantId), pad=10, fontsize=15, fontweight='bold')
        plt.axhline(0, color='black', linewidth=1)
        plt.xlabel('Household', fontsize=18, fontweight='bold')
        plt.ylabel('Error (days)', fontsize=18, fontweight='bold')
        plt.margins(y=0)

        fig = plt.gcf()
        fig.set_size_inches(11, 7.5) 
        fig.savefig("graph-errorsByHousehold.pdf", pad_inches=0, bbox_inches='tight', dpi=220)
        plt.close()

class Error:
    def __init__(self, cycleTime, error):
        self.cycleTime = cycleTime
        self.error = error
        self.absError = abs(error)




# HOUSEHOLD DATA
Data.households({
    1: Household(1, datetime.date(2018, 4, 11), datetime.date(2018, 6, 14), {23: 'message_2int', 36: ['2int','inbox'], 56: 'message_3int'}),
    2: Household(2, datetime.date(2018, 4, 11), datetime.date(2018, 6, 14), {23: 'message_2int', 36: '2int', 56: 'message_3int'}),
    3: Household(3, datetime.date(2018, 4, 12), datetime.date(2018, 6, 12), {16: 'inbox', 26: 'message_2int', 33: '2int', 48: 'inbox', 55: 'message_3int'}),
    4: Household(4, datetime.date(2018, 4, 12), datetime.date(2018, 6, 18), {26: 'message_2int', 36: '2int', 48: 'inbox', 55: 'message_3int'}),
    5: Household(5, datetime.date(2018, 4, 13), datetime.date(2018, 6, 13), {27: 'message_2int', 39: '2int', 47: ['inbox','message_3int']}),
    6: Household(6, datetime.date(2018, 6, 19), datetime.date(2018, 8, 23), {1: 'message_passcode', 23: 'message_2int', 29: '2int', 60: 'inbox'}),
    7: Household(7, datetime.date(2018, 6, 19), datetime.date(2018, 7, 31), {16: 'message_use', 17: 'call_help', 23: 'message_2int', 30: 'message_2int', 38: 'message_2int_cancel', 41: '2int'}),
    8: Household(8, datetime.date(2018, 6, 20), datetime.date(2018, 9, 5), {22: 'message_2int',33: '2int', 61: 'inbox'}),
    9: Household(9, datetime.date(2018, 6, 21), datetime.date(2018, 8, 28), {21: 'message_2int', 25: 'message_2int_cancel', 28: 'message_2int', 35: '2int', 60: 'inbox'}),
    10: Household(10, datetime.date(2018, 6, 22), datetime.date(2018, 8, 31), {20: 'message_2int', 27: '2int', 59: 'inbox'})
})





# EVENT DATA
print "Importing event data..."
cursor = mysqlConnection.cursor()
query = ("SELECT e.`user_id`, e.`user_id`- %d AS `householdId`, e.`timestamp`, c.`category` "
    "FROM `user_event` AS e "
    "LEFT JOIN `user_log_category` AS c ON e.`category` = c.`id` "
    "WHERE `user_id` > %d  "
    "UNION "
    "SELECT eb.`user_id`,  eb.`user_id`- %d AS `householdId`, eb.`timestamp`, c.`category` "
    "FROM `user_event_backlog` AS eb "
    "LEFT JOIN `user_log_category` AS c ON eb.`category` = c.`id` "
    "WHERE `user_id` > %d "
    "ORDER BY `user_id`" % (userIdParticipantOffset, startAtUserId, userIdParticipantOffset, startAtUserId))
cursor.execute(query)


eventData = Data.emptyListPerHousehold()
for (userId, householdId, timestamp, activity) in cursor:
    eventData[householdId].append(Event(householdId, timestamp, activity.replace(' ', '').replace('_', '')))
Data.events(Events(eventData))





# IMPORTANT SCAN DATA
print "Collating scan in/out data..."
cursor = mysqlConnection.cursor()
query = ("SELECT inv.`user_id`- %d AS `householdId`, `timestamp`, (SELECT CONCAT(CAT1, ' ', CAT2) AS 'categoryName' FROM categorised_inventory AS ci LEFT JOIN categories AS c ON c.id = ci.category_id WHERE ci.inventory_id = inv.id) AS categoryName, CONCAT('#', inv.`id`, ' (', prod.`brand_name`, ') ', prod.`description`) AS product, 'in' AS `action`, `old_stock`, `new_stock`, `new_stock`-`old_stock` AS 'delta_stock' FROM `inventory` AS inv "
    "LEFT JOIN `product` AS prod ON inv.`product_id` = prod.`id` "
    "LEFT JOIN `in_event` AS ine ON inv.`id` = ine.`inventory_id` "
    "WHERE inv.`user_id` > %d AND `timestamp` IS NOT NULL  "
    "UNION "
    "SELECT inv.`user_id`- %d AS `householdId`, `timestamp`, (SELECT CONCAT(CAT1, ' ', CAT2) AS 'categoryName' FROM categorised_inventory AS ci LEFT JOIN categories AS c ON c.id = ci.category_id WHERE ci.inventory_id = inv.id) AS categoryName, CONCAT('#', inv.`id`, ' (', prod.`brand_name`, ') ', prod.`description`) AS product, 'out' AS `action`, `old_stock`, `new_stock`, `new_stock`-`old_stock` AS 'delta_stock' FROM `inventory` AS inv "
    "LEFT JOIN `product` AS prod ON inv.`product_id` = prod.`id` "
    "LEFT JOIN `out_event` AS oute ON inv.`id` = oute.`inventory_id` "
    "WHERE inv.`user_id` > %d AND `timestamp` IS NOT NULL "
    "ORDER BY `householdId`, action, `categoryName`, `product`, `timestamp`") % (userIdParticipantOffset, startAtUserId, userIdParticipantOffset, startAtUserId)
cursor.execute(query)


scanData = Data.emptyListPerHousehold()
for (householdId, timestamp, category, product, action, oldStock, newStock, deltaStock) in cursor:
    if product is not None:
        scanData[householdId].append(Scan(householdId, timestamp, category, product, action, oldStock, newStock, deltaStock))
Data.scans(Scans(scanData))







# COLLATE PREDICTION DATA
print "Collating prediction data..."
cursor = mysqlConnection.cursor()
query = ("SELECT DISTINCT(pred.`id`),  inv.`user_id`- %d AS `householdId`, pred.`timestamp`, CONCAT(CAT1, ' ', CAT2) AS 'category', CONCAT('#', inv.`id`, ' (', prod.`brand_name`, ') ', prod.`description`) AS 'product', pred.`last_scanIn` AS 'lastScanIn', pred.`last_scanOut` AS 'lastScanOut',  pred.`days_average` AS `daysTillRunOut`, IF(pred.`stock_level` > 0, pred.`days_average`/pred.`stock_level`, pred.`days_average`) AS `averageUseInDays`, pred.`stock_level` AS 'currentStock', pred.`days_average` AS 'daysTillNeededFromLastScanIn', pred.`predicted_need_date` AS 'dateNeeded', DATEDIFF(pred.`predicted_need_date`, pred.`timestamp`) AS 'daysRemaining', `feedback` FROM `prediction` AS pred "
    "LEFT JOIN `inventory` AS inv ON pred.`inventory_id` = inv.`id` "
    "LEFT JOIN `product` prod ON inv.`product_id` = prod.`id` "
    "LEFT JOIN `categorised_inventory` AS catinv ON catinv.`product_id` = prod.`id` "
    "LEFT JOIN `categories` AS cat ON catinv.`category_id` = cat.`id` "
    "WHERE inv.`user_id` > %d "
    "ORDER BY pred.`user_id`, cat.`CAT1`, cat.`CAT2`, pred.`timestamp`, `product`" % (userIdParticipantOffset, startAtUserId))
cursor.execute(query)


predictionData = Data.emptyListPerHousehold()
for (id, householdId, timestamp, category, product, lastScanIn, lastScanOut, daysTillRunOut, averageUseInDays, currentStock, daysTillNeededFromLastScanIn, dateNeeded, daysRemaining, feedback) in cursor:
    if product is not None:
        predictionData[householdId].append(Prediction(id, householdId, timestamp, category, product, lastScanIn, lastScanOut, daysTillRunOut, averageUseInDays, currentStock, daysTillNeededFromLastScanIn, dateNeeded, daysRemaining, feedback))
Data.predictions(Predictions(predictionData))




# OUTPUT EACH CYCLE TIME AND ERROR
print "Outputting raw cycle times by item..."
with open('rawData-cycleTimeAndErrorByItem.csv', 'wb') as f:
    errorData = Data.errors().data

    dataRows = []
    maxNumCycles = 0
    for householdId, items in errorData.iteritems():
        for item, errors in items.iteritems():
            numCycles = 0
            dataRow = [householdId, item]
            for error in errors:
                numCycles += 1
                dataRow += [error.cycleTime, error.error, error.absError]

            maxNumCycles = max(maxNumCycles, numCycles)
            dataRows.append(dataRow)

    wr = csv.writer(f)
    wr.writerow(["householdId", "item"] + (["cycleTime", "error", "abs. error"] * maxNumCycles))
    for row in dataRows:
        wr.writerow(row)



# OUTPUT EACHERROR
print "Outputting raw errors by item..."
with open('rawData-cycleErrorByItem.csv', 'wb') as f:
    errorData = Data.errors().data

    dataRows = []
    maxNumCycles = 0
    for householdId, items in errorData.iteritems():
        for item, errors in items.iteritems():
            numCycles = 0
            dataRow = [householdId, item]
            for error in errors:
                numCycles += 1
                dataRow += [error.error]

            maxNumCycles = max(maxNumCycles, numCycles)
            dataRows.append(dataRow)

    wr = csv.writer(f)
    wr.writerow(["householdId", "item"] + (["error"] * maxNumCycles))
    for row in dataRows:
        wr.writerow(row)



# OUTPUT EACH CYCLE TIME
print "Outputting raw cycle times by item..."
with open('rawData-cycleTimeByItem.csv', 'wb') as f:
    cycleData = Data.scans().cycleData

    dataRows = []
    maxNumCycles = 0
    for householdId, items in cycleData.iteritems():
        for item, cycles in items.iteritems():
            numCycles = 0
            dataRow = [householdId, item]
            for cycle in cycles:
                numCycles += 1
                dataRow += [cycle]

            maxNumCycles = max(maxNumCycles, numCycles)
            dataRows.append(dataRow)

    wr = csv.writer(f)
    wr.writerow(["householdId", "item"] + (["cycleTime"] * maxNumCycles))
    for row in dataRows:
        wr.writerow(row)




# OUTPUT CYCLE SUMMARIES BY ITEM
print "Outputting summary of cycles and errors by item..."
with open('summaryData-cyclesAndErrorsByItem.csv', 'wb') as f:
    errorData = Data.errors().data
    scanInData = Data.scans().scanInData
    scanOutData = Data.scans().scanOutData
    cycleData = Data.scans().cycleData

    dataRows = []
    maxNumCycles = 0
    for householdId, items in errorData.iteritems():
        for item, errors in items.iteritems():
            numCycles = 0

            numScanIns = len(scanInData[householdId][item])
            numScanOuts = len(scanOutData[householdId][item])

            cycles = cycleData[householdId][item]
            numCycles = len(cycles)
            sumCycleTime = sum(cycles)
            meanCycleTime = numpy.mean(cycles)

            if numCycles < 2:
                absErrors = []
                sumErrors = 0
                numError = 0
                meanError = "nan"
                medianError = "nan"
                sdError = "nan"
            else:
                absErrors = [n.absError for n in errors]
                sumErrors = sum(absErrors)
                numErrors = len(absErrors)
                meanError = numpy.mean(absErrors)
                medianError = numpy.median(absErrors)
                sdError = numpy.std(absErrors)

            dataRow = [householdId, item, "", numScanIns, numScanOuts, numCycles, sumCycleTime, meanCycleTime, sumErrors, numErrors, meanError, medianError, sdError]
            maxNumCycles = max(maxNumCycles, numCycles)

            dataRows.append(dataRow)

    wr = csv.writer(f)
    wr.writerow(["Household", "Item", "Post-hoc category", "# Scan ins", "# Scan outs", "# cycles", "Sum cycles", "Mean cycle", "Sum abs. errors", "# errors", "Mean abs. error", "Median abs. error", "sd abs. error"])
    for row in dataRows:
        wr.writerow(row)



# OUTPUT CYCLE SUMMARIES BY HOUSEHOLD
print "Outputting summary of cycles and errors by household..."
with open('summaryData-cyclesAndErrorsByHousehold.csv', 'wb') as f:
    errorData = Data.errors().data
    cycleData = Data.scans().cycleData

    dataRows = []
    for householdId, items in errorData.iteritems():
        accumulatedCycles = []
        accumulatedErrors = []

        for item, errors in items.iteritems():
            cycles = cycleData[householdId][item]
            accumulatedCycles += cycles
            if len(cycles) > 1:
                accumulatedErrors += [n.absError for n in errors]

        numCycles = len(accumulatedCycles)
        numErrors  = len(accumulatedErrors)

        if numCycles < 2:
            continue

        meanCycle = numpy.mean(accumulatedCycles)
        meanAbsError = numpy.mean(accumulatedErrors)
        sdAbsError = numpy.std(accumulatedErrors)

        numItems = len(Data.scans().itemData[householdId])
        numItemsCycle = len(Data.scans().itemDataWithCycle[householdId])
        numItemsCycles = len(Data.scans().itemDataWithCycles[householdId])

        dataRows.append([householdId, numItems, numItemsCycle, numItemsCycles, numCycles, meanCycle, numErrors, meanAbsError, sdAbsError])

    wr = csv.writer(f)
    wr.writerow(["Household", "# items", "# items w/cycle", "#items w/2+ cycles", "# cycles", "Mean cycle", "# errors", "Mean abs. error", "sd abs. error"])
    for row in dataRows:
        wr.writerow(row)

print "Done."
