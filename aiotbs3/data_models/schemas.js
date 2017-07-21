var schemas = {
    user: {
        id: null,
        name: null,
        password: null
    },
    inventory_mapping: {
    	id: null, //CPK
    	product_id: null, //FK UK
    	user_id: null, //FK UK
    	stock_level: null,
    	predicted_need_date: null,
    	stock_delta_day: null, 
    	need_trigger_stock_level: null
    },
    
    in_events: {
    	id: null, // PK
    	inventory_id: null, //FK
    	old_stock_level: null,
    	new_stock_level: null,
    	timestamp: null
    },
    
    out_events: {
    	id: null // PK
    	inventory_id: null, // FK
    	old_stock_level: null,
    	new_stock_level: null,
    	timestamp: null
    },
    
    inventory_usage_events: {
    	id: null // PK
    	inventory_id: null, // FK
    	trigger_description: null,
    	old_stock_level: null,
    	new_stock_level: null,
    	timestamp: null
    },
    
    user_event_log: {
    	id: null // PK
    	user_id: null, // FK
    	category: null,
    	timestamp  
    },
    
    products: {
    	id: null, // PK
    	EAN: null,
    	brand_name: null,
    	description: null,
    	multipack: null,
    	multipack_amount: null,
    	quantity: null,
    	quanitiy_unit: null,
    	metadata: null
    }


}

module.exports = schemas;