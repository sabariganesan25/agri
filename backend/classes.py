# backend/classes.py
# Mapping 45 detection classes to UI metadata and advisory text

CLASS_METADATA = {
    # Healthy & Field State
    "healthy_crop": {"risk": "LOW", "emoji": "🌱", "color": [0, 255, 0], "category": "HEALTHY", "advisory": "Maintain current agricultural practices. Crop health is optimal."},
    "healthy_leaf": {"risk": "LOW", "emoji": "🌿", "color": [0, 255, 0], "category": "HEALTHY", "advisory": "Leaf condition is optimal. Ensure regular watering."},
    "healthy_field": {"risk": "LOW", "emoji": "🏞️", "color": [0, 255, 0], "category": "HEALTHY", "advisory": "Field ecosystem is stable. No action required."},

    # Blights & Spots
    "early_blight": {"risk": "MEDIUM", "emoji": "🍂", "color": [0, 165, 255], "category": "DISEASE", "advisory": "Fungal infection detected. Apply copper-based fungicide."},
    "late_blight": {"risk": "HIGH", "emoji": "🥀", "color": [0, 0, 255], "category": "DISEASE", "advisory": "Critical fungal infection. Immediately apply systemic fungicide and isolate area."},
    "leaf_blight": {"risk": "MEDIUM", "emoji": "🍁", "color": [0, 165, 255], "category": "DISEASE", "advisory": "Apply appropriate fungicide and ensure good air circulation."},
    "leaf_rust": {"risk": "MEDIUM", "emoji": "🦠", "color": [0, 165, 255], "category": "DISEASE", "advisory": "Remove severely infected leaves and spray rust-specific fungicide."},
    "bacterial_blight": {"risk": "HIGH", "emoji": "🦠", "color": [0, 0, 255], "category": "DISEASE", "advisory": "High risk of spread. Prune infected parts and apply copper bactericide."},
    "cercospora_leaf_spot": {"risk": "MEDIUM", "emoji": "🔴", "color": [0, 165, 255], "category": "DISEASE", "advisory": "Apply preventive fungicide and clear fallen debris."},
    "anthracnose": {"risk": "MEDIUM", "emoji": "🍄", "color": [0, 165, 255], "category": "DISEASE", "advisory": "Improve drainage and apply chlorothalonil fungicide."},
    "powdery_mildew": {"risk": "MEDIUM", "emoji": "🌬️", "color": [0, 165, 255], "category": "DISEASE", "advisory": "Apply sulfur or potassium bicarbonate based sprays."},
    "downy_mildew": {"risk": "MEDIUM", "emoji": "💧", "color": [0, 165, 255], "category": "DISEASE", "advisory": "Decrease humidity around plants. Use specifically formulated mildewcides."},
    "leaf_spot": {"risk": "LOW", "emoji": "🟢", "color": [0, 200, 255], "category": "DISEASE", "advisory": "Monitor for spread. Avoid overhead watering."},

    # Viruses & Rots
    "mosaic_virus": {"risk": "HIGH", "emoji": "🧬", "color": [0, 0, 255], "category": "VIRUS", "advisory": "Virus detected. Remove and destroy infected plants. Control aphid vectors."},
    "yellow_leaf_curl": {"risk": "HIGH", "emoji": "🟡", "color": [0, 0, 255], "category": "VIRUS", "advisory": "Severe viral infection. Eradicate plant and control whiteflies."},
    "stem_rot": {"risk": "HIGH", "emoji": "🪵", "color": [0, 0, 255], "category": "DISEASE", "advisory": "Soil-borne pathogen. Reduce watering and apply soil fungicide."},
    "bacterial_wilt": {"risk": "HIGH", "emoji": "📉", "color": [0, 0, 255], "category": "DISEASE", "advisory": "No cure. Remove entire plant to prevent soil contamination."},
    "root_rot": {"risk": "HIGH", "emoji": "🪱", "color": [0, 0, 255], "category": "DISEASE", "advisory": "Improve soil drainage immediately. Plant may need removal."},

    # Pests
    "aphids": {"risk": "MEDIUM", "emoji": "🪰", "color": [0, 165, 255], "category": "PEST", "advisory": "Spray neem oil or insecticidal soap. Introduce ladybugs."},
    "whitefly": {"risk": "MEDIUM", "emoji": "🦟", "color": [0, 165, 255], "category": "PEST", "advisory": "Use yellow sticky traps and horticultural oils."},
    "caterpillar": {"risk": "MEDIUM", "emoji": "🐛", "color": [0, 165, 255], "category": "PEST", "advisory": "Apply Bt (Bacillus thuringiensis) or pick off manually."},
    "grasshopper": {"risk": "MEDIUM", "emoji": "🦗", "color": [0, 165, 255], "category": "PEST", "advisory": "Use insecticidal baits or organic neem sprays."},
    "stem_borer": {"risk": "HIGH", "emoji": "🕷️", "color": [0, 0, 255], "category": "PEST", "advisory": "Difficult to treat. Remove affected stems. Apply targeted systemic insecticides."},
    "mite_damage": {"risk": "MEDIUM", "emoji": "🕸️", "color": [0, 165, 255], "category": "PEST", "advisory": "Increase humidity and apply miticides or neem oil."},
    
    # Intrusions (Animals/People)
    "cow": {"risk": "HIGH", "emoji": "🐄", "color": [0, 0, 255], "category": "INTRUSION", "advisory": "Livestock intrusion. Secure perimeter fencing."},
    "sheep": {"risk": "HIGH", "emoji": "🐑", "color": [0, 0, 255], "category": "INTRUSION", "advisory": "Livestock intrusion. Secure perimeter fencing."},
    "goat": {"risk": "HIGH", "emoji": "🐐", "color": [0, 0, 255], "category": "INTRUSION", "advisory": "Livestock intrusion. Secure perimeter fencing."},
    "horse": {"risk": "HIGH", "emoji": "🐎", "color": [0, 0, 255], "category": "INTRUSION", "advisory": "Livestock intrusion. Secure perimeter fencing."},
    "bird": {"risk": "MEDIUM", "emoji": "🐦", "color": [0, 165, 255], "category": "INTRUSION", "advisory": "Potential crop damage. Deploy bird deterrents."},
    "rat": {"risk": "HIGH", "emoji": "🐀", "color": [0, 0, 255], "category": "PEST", "advisory": "Rodent infestation. Set secure traps and protect grain/roots."},
    "person": {"risk": "MEDIUM", "emoji": "🧑‍🌾", "color": [255, 255, 0], "category": "INTRUSION", "advisory": "Human presence detected in field sector."},

    # Weeds
    "weed": {"risk": "LOW", "emoji": "🌿", "color": [0, 200, 255], "category": "WEED", "advisory": "Apply selective herbicide or manual weeding."},
    "broadleaf_weed": {"risk": "MEDIUM", "emoji": "🍀", "color": [0, 165, 255], "category": "WEED", "advisory": "Apply broadleaf-specific herbicide."},
    "grass_weed": {"risk": "MEDIUM", "emoji": "🌾", "color": [0, 165, 255], "category": "WEED", "advisory": "Apply grass-specific herbicide."},

    # Environmental/Soil Issues
    "dry_soil": {"risk": "HIGH", "emoji": "🏜️", "color": [0, 0, 255], "category": "ENVIRONMENT", "advisory": "Critical water deficit. Initiate irrigation immediately."},
    "waterlogging": {"risk": "HIGH", "emoji": "🌊", "color": [0, 0, 255], "category": "ENVIRONMENT", "advisory": "Poor drainage. Clear trenches to prevent root asphyxiation."},
    "soil_erosion": {"risk": "HIGH", "emoji": "⛰️", "color": [0, 0, 255], "category": "ENVIRONMENT", "advisory": "Topsoil loss detected. Plant cover crops and establish barriers."},
    "nutrient_deficiency": {"risk": "MEDIUM", "emoji": "🧪", "color": [0, 165, 255], "category": "ENVIRONMENT", "advisory": "Test soil. Apply balanced NPK fertilizer and micronutrients."},

    # Plant Types (Reference Context, LOW risk)
    "rice_plant": {"risk": "LOW", "emoji": "🌾", "color": [0, 255, 0], "category": "CROP", "advisory": "Crop identified as Rice."},
    "wheat_plant": {"risk": "LOW", "emoji": "🍞", "color": [0, 255, 0], "category": "CROP", "advisory": "Crop identified as Wheat."},
    "corn_plant": {"risk": "LOW", "emoji": "🌽", "color": [0, 255, 0], "category": "CROP", "advisory": "Crop identified as Corn."},
    "tomato_plant": {"risk": "LOW", "emoji": "🍅", "color": [0, 255, 0], "category": "CROP", "advisory": "Crop identified as Tomato."},
    "potato_plant": {"risk": "LOW", "emoji": "🥔", "color": [0, 255, 0], "category": "CROP", "advisory": "Crop identified as Potato."},
    "cotton_plant": {"risk": "LOW", "emoji": "🧶", "color": [0, 255, 0], "category": "CROP", "advisory": "Crop identified as Cotton."},
    "sugarcane": {"risk": "LOW", "emoji": "🎋", "color": [0, 255, 0], "category": "CROP", "advisory": "Crop identified as Sugarcane."}
}

# The 45 classes ordered strictly by the class_names.json to map YOLO index to label
CLASS_NAMES = [
    "healthy_crop", "healthy_leaf", "healthy_field", "early_blight", "late_blight",
    "leaf_blight", "leaf_rust", "bacterial_blight", "mosaic_virus", "yellow_leaf_curl",
    "stem_rot", "bacterial_wilt", "root_rot", "cercospora_leaf_spot", "anthracnose",
    "powdery_mildew", "downy_mildew", "leaf_spot", "aphids", "whitefly",
    "caterpillar", "grasshopper", "stem_borer", "mite_damage", "weed",
    "broadleaf_weed", "grass_weed", "rice_plant", "wheat_plant", "corn_plant",
    "tomato_plant", "potato_plant", "cotton_plant", "sugarcane", "cow",
    "sheep", "goat", "horse", "bird", "rat", "person", "dry_soil",
    "waterlogging", "soil_erosion", "nutrient_deficiency"
]
