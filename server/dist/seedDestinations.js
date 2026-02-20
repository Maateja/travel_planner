import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from './models/Destination.js';
dotenv.config();
const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
const destinationTemplates = {
    "Adventure": { min: 5000, max: 15000, days: 3, desc: "An adrenaline-pumping adventure await you here with Various activities." },
    "Nature": { min: 3000, max: 10000, days: 2, desc: "Immerse yourself in the serene beauty of nature and lush landscapes." },
    "Spiritual": { min: 2000, max: 7000, days: 2, desc: "Find peace and spiritual awakening in this sacred destination." },
    "Beach": { min: 4000, max: 12000, days: 3, desc: "Relax on the sandy shores and enjoy the rhythmic sound of waves." },
    "Heritage": { min: 2500, max: 8000, days: 2, desc: "Explore the rich history and architectural marvels of the past." },
    "Hill Station": { min: 4500, max: 13000, days: 3, desc: "Escape to the cool heights and breathtaking mountain views." },
    "City": { min: 3000, max: 15000, days: 2, desc: "Experience the vibrant urban life, shopping, and modern attractions." },
    "Wildlife": { min: 6000, max: 18000, days: 3, desc: "Discover diverse flora and fauna in their natural habitat." }
};
const categories = Object.keys(destinationTemplates);
// Helper to generate coordinates roughly within India (8N-37N, 68E-97E)
// We'll use more specific bounds per state if possible, but for now, we'll use state-centered randoms.
const stateCenters = {
    "Andhra Pradesh": [15.91, 79.74],
    "Arunachal Pradesh": [28.21, 94.72],
    "Assam": [26.20, 92.93],
    "Bihar": [25.09, 85.31],
    "Chhattisgarh": [21.27, 81.86],
    "Goa": [15.29, 74.12],
    "Gujarat": [22.25, 71.19],
    "Haryana": [29.05, 76.08],
    "Himachal Pradesh": [31.10, 77.17],
    "Jharkhand": [23.61, 85.27],
    "Karnataka": [15.31, 75.71],
    "Kerala": [10.85, 76.27],
    "Madhya Pradesh": [23.47, 77.94],
    "Maharashtra": [19.75, 75.71],
    "Manipur": [24.66, 93.90],
    "Meghalaya": [25.46, 91.36],
    "Mizoram": [23.16, 92.93],
    "Nagaland": [26.15, 94.56],
    "Odisha": [20.95, 85.09],
    "Punjab": [31.14, 75.34],
    "Rajasthan": [27.02, 74.21],
    "Sikkim": [27.53, 88.51],
    "Tamil Nadu": [11.12, 78.65],
    "Telangana": [18.11, 79.01],
    "Tripura": [23.94, 91.98],
    "Uttar Pradesh": [26.84, 80.94],
    "Uttarakhand": [30.06, 79.01],
    "West Bengal": [22.98, 87.85]
};
const realDestinations = {
    "Tamil Nadu": ["Ooty", "Kodaikanal", "Madurai", "Rameswaram", "Yercaud", "Kanyakumari", "Mahabalipuram", "Chennai", "Coimbatore", "Tiruchirappalli", "Thanjavur", "Vellore", "Kanchipuram", "Nagapattinam", "Coonoor", "Tuticorin", "Tirunelveli", "Salem", "Dharmapuri", "Theni"],
    "Karnataka": ["Coorg", "Mysore", "Hampi", "Gokarna", "Chikmagalur", "Bangalore", "Badami", "Shimoga", "Udupi", "Mangalore", "Belur", "Halebidu", "Bijapur", "Karwar", "Nandi Hills", "Bandipur", "Jog Falls", "Kabini", "Dandeli", "Agumbe"],
    "Maharashtra": ["Mumbai", "Pune", "Mahabaleshwar", "Lonavala", "Ajanta Caves", "Ellora Caves", "Shirdi", "Nashik", "Nagpur", "Aurangabad", "Khandala", "Panchgani", "Alibaug", "Matheran", "Tarkarli", "Lavasa", "Ratnagiri", "Kolhapur", "Bhandardara", "Kashid"],
    "Kerala": ["Munnar", "Alleppey", "Kochi", "Thekkady", "Wayanad", "Varkala", "Kovalam", "Kumarakom", "Thrissur", "Trivandrum", "Idukki", "Bekal", "Vagamon", "Poovar", "Kozhikode", "Athirappilly", "Guruvayur", "Palakkad", "Kanoor", "Silent Valley"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer", "Pushkar", "Mount Abu", "Bikaner", "Ajmer", "Chittorgarh", "Ranthambore", "Bharatpur", "Alwar", "Bundu", "Shekhawati", "Mandawa", "Kumbhalgarh", "Nathdwara", "Kota", "Jhalawar", "Barmer"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Dalhousie", "Kasol", "Kullu", "Spiti Valley", "Kaza", "Bir Billing", "Chamba", "Mcleodganj", "Palampur", "Solan", "Kufri", "Rohtang Pass", "Narkanda", "Sangla", "Kalpa", "Jibhi", "Parwanoo"],
    "Uttarakhand": ["Rishikesh", "Haridwar", "Mussoorie", "Nainital", "Dehradun", "Auli", "Jim Corbett", "Kedarnath", "Badrinath", "Valley of Flowers", "Chopta", "Lansdowne", "Ranikhet", "Kausani", "Mukteshwar", "Binsar", "Almora", "Joshimath", "Tehri", "Munsiyari"],
    "Goa": ["Calangute", "Baga", "Anjuna", "Panaji", "Palolem", "Colva", "Old Goa", "Vagator", "Dudhsagar Falls", "Candolim", "Agonda", "Arambol", "Morjim", "Dona Paula", "Ponda", "Margao", "Benaulim", "Majorda", "Vasco da Gama", "South Goa"],
    "Andhra Pradesh": ["Visakhapatnam", "Tirupati", "Vijayawada", "Araku Valley", "Kurnool", "Nellore", "Kadapa", "Chittoor", "Anantapur", "Eluru", "Guntur", "Machilipatnam", "Kakinada", "Rajahmundry", "Srikakulam", "Vizianagaram", "Horsley Hills", "Lepakshi", "Amaravati", "Gandikota"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat", "Roing", "Tezu", "Bomdila", "Khonsa", "Along", "Namsai", "Dirang", "Bhalukpong", "Mechuka", "Anini", "Namdapha", "Pakhui", "Gorichen Peak", "Sela Pass", "Madhuri Lake", "Talle Valley"],
    "Assam": ["Guwahati", "Kaziranga", "Majuli", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Haflong", "Sivasagar", "Manas National Park", "Diphu", "Goalpara", "Karimganj", "Dhubri", "Barpeta", "Nalbari", "Mangaldai"],
    "Bihar": ["Patna", "Gaya", "Bodh Gaya", "Nalanda", "Rajgir", "Vaishali", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Munger", "Sasaram", "Bihar Sharif", "Saharsa", "Katihar", "Motihari", "Siwan", "Buxar"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Somnath", "Dwarka", "Saputara", "Gir National Park", "Rann of Kutch", "Bhuj", "Porbandar", "Anand", "Mehsana", "Morbi", "Vapi", "Bharuch"],
    "West Bengal": ["Kolkata", "Darjeeling", "Siliguri", "Digha", "Sundarbans", "Kalimpong", "Shantiniketan", "Murshidabad", "Asansol", "Durgapur", "Howrah", "Haldia", "Malda", "Jalpaiguri", "Cooch Behar", "Bankura", "Purulia", "Burdwan", "Kharagpur", "Bishnupur"]
};
// Fill missing states with 20 generic-named destinations if needed
// For the sake of this task, I'll generate names for the remaining states to ensure 20 each.
const generateDestinations = () => {
    const allData = [];
    for (const state of states) {
        const stateDestList = realDestinations[state] || [];
        const baseCoords = stateCenters[state] || [20, 78];
        for (let i = 0; i < 20; i++) {
            let name = stateDestList[i] || `${state} Spot ${i + 1}`;
            const category = categories[Math.floor(Math.random() * categories.length)];
            const template = destinationTemplates[category];
            allData.push({
                name,
                state,
                short_description: template.desc,
                estimated_budget_min: template.min + Math.floor(Math.random() * 2000),
                estimated_budget_max: template.max + Math.floor(Math.random() * 5000),
                recommended_days: template.days + (Math.random() > 0.7 ? 1 : 0),
                latitude: baseCoords[0] + (Math.random() - 0.5) * 1.5,
                longitude: baseCoords[1] + (Math.random() - 0.5) * 1.5,
                category
            });
        }
    }
    return allData;
};
const seed = async () => {
    try {
        console.log('Connecting to MongoDB for seeding...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');
        console.log('Cleaning existing destinations...');
        await Destination.deleteMany({});
        const data = generateDestinations();
        console.log(`Seeding ${data.length} destinations...`);
        await Destination.insertMany(data);
        console.log('Seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
seed();
