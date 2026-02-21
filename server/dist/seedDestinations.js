import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from './models/Destination.js';
dotenv.config();
const categories = ['Adventure', 'Nature', 'Spiritual', 'Beach', 'Heritage', 'Hill Station', 'City', 'Wildlife'];
const destinationTemplates = {
    'Adventure': { desc: 'Thrilling activities and outdoor sports.', min: 3000, max: 8000, days: 3 },
    'Nature': { desc: 'Beautiful landscapes and natural wonders.', min: 2000, max: 6000, days: 2 },
    'Spiritual': { desc: 'Peaceful religious and spiritual sites.', min: 1000, max: 4000, days: 2 },
    'Beach': { desc: 'Sun, sand, and relaxing waves.', min: 4000, max: 10000, days: 4 },
    'Heritage': { desc: 'Ancient monuments and cultural history.', min: 1500, max: 5000, days: 2 },
    'Hill Station': { desc: 'Cool climates and mountain views.', min: 3500, max: 9000, days: 3 },
    'City': { desc: 'Vibrant urban culture and shopping.', min: 2500, max: 7000, days: 2 },
    'Wildlife': { desc: 'Amazing animals and forest safaris.', min: 5000, max: 12000, days: 3 }
};
const REAL_COORDS = {
    // Andhra Pradesh
    "Tirupati": [13.6288, 79.4192],
    "Visakhapatnam": [17.6868, 83.2185],
    "Vijayawada": [16.5062, 80.6480],
    "Araku Valley": [18.3273, 82.8772],
    "Horsley Hills": [13.65, 78.40],
    "Madanapalle": [13.5512, 78.5020],
    "Kurnool": [15.8281, 78.0373],
    "Nellore": [14.4426, 79.9865],
    "Vizianagaram": [18.1124, 83.3956],
    "Kadapa": [14.4673, 78.8242],
    "Gandikota": [14.8142, 78.2861],
    "Lepakshi": [13.8044, 77.6080],
    "Anantapur": [14.6819, 77.6006],
    // Kerala
    "Trivandrum": [8.5241, 76.9366],
    "Varkala": [8.7302, 76.7056],
    "Kovalam": [8.4020, 76.9784],
    "Ponmudi": [8.7597, 77.1147],
    "Alleppey": [9.4981, 76.3388],
    "Munnar": [10.0889, 77.0595],
    "Wayanad": [11.6854, 76.1320],
    "Thekkady": [9.6031, 77.1615],
    "Kochi": [9.9312, 76.2673],
    // Telangana
    "Hyderabad": [17.3850, 78.4867],
    "Warangal": [17.9689, 79.5941],
    "Nagarjunasagar": [16.5815, 79.3130],
    "Bhadrachalam": [17.6687, 80.8935],
    "Ananthagiri Hills": [17.3106, 77.8631],
    // Karnataka
    "Bangalore": [12.9716, 77.5946],
    "Coorg": [12.3375, 75.8069],
    "Mysore": [12.2958, 76.6394],
    "Hampi": [15.3350, 76.4600],
    "Gokarna": [14.5479, 74.3188],
    "Nandi Hills": [13.3702, 77.6835],
    // Tamil Nadu
    "Chennai": [13.0827, 80.2707],
    "Ooty": [11.4100, 76.6950],
    "Kodaikanal": [10.2381, 77.4892],
    "Madurai": [9.9252, 78.1198],
    "Kanyakumari": [8.0883, 77.5385],
    // Goa & Others
    "Panaji": [15.4909, 73.8278],
    "Delhi": [28.6139, 77.2090],
    "Jaipur": [26.9124, 75.7873],
    "Mumbai": [19.0760, 72.8777]
};
const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];
const stateCenters = {
    "Andhra Pradesh": [14.50, 78.50],
    "Kerala": [10.85, 76.27],
    "Karnataka": [15.31, 75.71],
    "Tamil Nadu": [11.12, 78.65],
    "Telangana": [17.38, 78.48]
};
const realDestinations = {
    "Andhra Pradesh": ["Visakhapatnam", "Tirupati", "Vijayawada", "Araku Valley", "Kurnool", "Nellore", "Kadapa", "Horsley Hills", "Lepakshi", "Gandikota", "Madanapalle"],
    "Kerala": ["Munnar", "Alleppey", "Kochi", "Thekkady", "Wayanad", "Varkala", "Kovalam", "Trivandrum", "Ponmudi"],
    "Karnataka": ["Coorg", "Mysore", "Hampi", "Gokarna", "Bangalore", "Halebidu", "Nandi Hills", "Kabini"],
    "Tamil Nadu": ["Ooty", "Kodaikanal", "Madurai", "Rameswaram", "Chennai", "Mahabalipuram", "Kanyakumari", "Yercaud"],
    "Telangana": ["Hyderabad", "Warangal", "Nagarjunasagar", "Bhadrachalam", "Ananthagiri Hills"]
};
const generateDestinations = () => {
    const allData = [];
    for (const state of states) {
        const stateDestList = realDestinations[state] || [];
        const baseCoords = stateCenters[state] || [20, 78];
        for (const cityName of stateDestList) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const template = destinationTemplates[category];
            const coords = REAL_COORDS[cityName] || [
                baseCoords[0] + (Math.random() - 0.5) * 0.5,
                baseCoords[1] + (Math.random() - 0.5) * 0.5
            ];
            allData.push({
                name: cityName,
                state,
                short_description: template.desc,
                estimated_budget_min: template.min + Math.floor(Math.random() * 2000),
                estimated_budget_max: template.max + Math.floor(Math.random() * 5000),
                recommended_days: template.days,
                latitude: coords[0],
                longitude: coords[1],
                category
            });
        }
    }
    return allData;
};
async function seed() {
    try {
        console.log('Seeding Real Locations & Hills areas...');
        await mongoose.connect(process.env.MONGODB_URI);
        await Destination.deleteMany({});
        const data = generateDestinations();
        await Destination.insertMany(data);
        console.log('Seeding complete!');
        process.exit(0);
    }
    catch (e) {
        process.exit(1);
    }
}
seed();
