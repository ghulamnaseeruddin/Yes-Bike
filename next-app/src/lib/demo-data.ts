export type DemoProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  category: string;
  stock: number;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  images: string[];
  sizes: string[];
  colors: string[];
};

type ProductRange = {
  category: string;
  names: string[];
  basePrice: number;
  image: string;
  sizes: string[];
  colors: string[];
};

const catalog: ProductRange[] = [
  {
    category: "Jackets",
    names: ["RidgeLine Touring Jacket", "StormGuard Textile Jacket", "Apex Ventilated Jacket", "Urban Shield Jacket", "TrailFlex Adventure Jacket", "Carbon Edge Leather Jacket", "RainRoute All-Weather Jacket", "Summit Mesh Jacket", "NightRide Reflective Jacket", "Enduro Pro Jacket"],
    basePrice: 1899,
    image: "https://images.unsplash.com/photo-1605927328330-12d03b41225f?auto=format&fit=crop&w=960&q=85",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Red", "Grey"],
  },
  {
    category: "Gloves",
    names: ["GripCore Short-Cuff Gloves", "RallyGuard Gauntlet Gloves", "AeroMesh Summer Gloves", "ThermoRide Winter Gloves", "ImpactX Knuckle Gloves", "TrailPro Enduro Gloves", "UrbanFlex Leather Gloves", "StormSeal Waterproof Gloves", "CarbonPalm Race Gloves", "TourFit Touring Gloves"],
    basePrice: 499,
    image: "https://images.unsplash.com/photo-1677751808418-47e3ce898fe5?auto=format&fit=crop&w=960&q=85",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Red", "Tan"],
  },
  {
    category: "Helmets",
    names: ["Apex Full-Face Helmet", "Metro Modular Helmet", "Velocity Race Helmet", "TrailScout Adventure Helmet", "Echo Open-Face Helmet", "CarbonLite Touring Helmet", "NightShift Visor Helmet", "JuniorRide Youth Helmet", "TrackLine Graphic Helmet", "RoadMate Commuter Helmet"],
    basePrice: 2199,
    image: "https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=960&q=85",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Matte Black", "White", "Red"],
  },
  {
    category: "Boots",
    names: ["Metro Touring Boots", "IronPeak Adventure Boots", "TrackForce Race Boots", "TrailCore Enduro Boots", "CityGrip Commuter Boots", "StormStep Waterproof Boots", "RidgeWalker Protective Boots", "CarbonFlex Sport Boots", "Summit ADV Boots", "RoadGuard Short Boots"],
    basePrice: 1499,
    image: "https://images.unsplash.com/photo-1582716510825-0ea3f7bd8334?auto=format&fit=crop&w=960&q=85",
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Black", "Brown"],
  },
  {
    category: "Riding Pants",
    names: ["Summit Riding Pants", "RidgeLine Textile Pants", "Apex Track Pants", "UrbanFlex Riding Jeans", "TrailGuard Adventure Pants", "StormShell Overpants", "CarbonKnee Protective Pants", "TourRoute All-Weather Pants", "EnduroFlex Mesh Pants", "RoadCraft Reinforced Jeans"],
    basePrice: 1299,
    image: "https://images.unsplash.com/photo-1600497934947-23786a93f382?auto=format&fit=crop&w=960&q=85",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Grey", "Blue"],
  },
  {
    category: "Leather Suits",
    names: ["Elite Race Suit", "Velocity One-Piece Suit", "TrackLine Pro Suit", "Apex Two-Piece Suit", "CarbonShell Racing Suit", "RidgeRunner Leather Suit", "StormCircuit Race Suit", "RoadCraft Sport Suit", "Summit Performance Suit", "EnduroShield Leather Suit"],
    basePrice: 4999,
    image: "https://images.unsplash.com/photo-1601440497908-ed85798ebbd9?auto=format&fit=crop&w=960&q=85",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Red", "White"],
  },
  {
    category: "Base Layers",
    names: ["BreatheDry Base Top", "ThermoRide Thermal Top", "CoolRoute Summer Layer", "CoreFlex Compression Top", "DryTrack Base Leggings", "WinterLine Thermal Set", "AirFlow Mesh Layer", "RoadSkin Riding Base", "Summit Wicking Top", "AllSeason Base Layer"],
    basePrice: 399,
    image: "https://images.unsplash.com/photo-1653725565489-dfddc2b4cbf0?auto=format&fit=crop&w=960&q=85",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Grey"],
  },
  {
    category: "Protective Armor",
    names: ["ImpactCore Back Protector", "FlexGuard Knee Armor", "RidgeChest Chest Protector", "TrackSafe Elbow Guards", "EnduroShield Body Armor", "CarbonLite Back Insert", "RoadGuard Hip Protectors", "Summit Pro Armor Vest", "Apex Race Knee Sliders", "TrailForce Shoulder Pads"],
    basePrice: 299,
    image: "https://images.unsplash.com/photo-1605927328330-12d03b41225f?auto=format&fit=crop&w=960&q=85",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Red"],
  },
  {
    category: "Rainwear",
    names: ["StormShell Rain Jacket", "DryRoute Rain Pants", "AllWeather Suit", "RoadMist Waterproof Gloves", "CloudBreak Over-Jacket", "Monsoon Touring Set", "RainLine Boot Covers", "TrailDry Packable Shell", "AquaGuard Commuter Suit", "WetRoad Hi-Vis Jacket"],
    basePrice: 599,
    image: "https://images.unsplash.com/photo-1605927328330-12d03b41225f?auto=format&fit=crop&w=960&q=85",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Yellow", "Red"],
  },
  {
    category: "Rider Luggage",
    names: ["TrailPack Tail Bag", "RoadCase Tank Bag", "Summit 30L Pannier", "MetroLock Helmet Bag", "RidgeLine Roll Bag", "TourRoute Saddle Bags", "EnduroDry Duffel", "Apex Compact Tail Pack", "CityRide Leg Bag", "LongHaul Top Case"],
    basePrice: 699,
    image: "https://images.unsplash.com/photo-1614771161300-0b7084bd5cd6?auto=format&fit=crop&w=960&q=85",
    sizes: ["One size"],
    colors: ["Black", "Grey"],
  },
];

export const demoProducts: DemoProduct[] = catalog.flatMap((range) =>
  range.names.map((name, index) => {
    const price = range.basePrice + index * 85;
    const slug = range.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
    return {
      id: `demo-${slug}-${index + 1}`,
      name,
      description: `${name} from the ${range.category} collection, selected for comfort, durability, and everyday riding protection.`,
      price,
      discountPrice: index % 4 === 0 ? Math.round(price * 0.9) : null,
      category: range.category,
      stock: 6 + ((index * 7 + range.basePrice) % 20),
      featured: index < 2,
      isNew: index % 3 === 0,
      isBestSeller: index < 2,
      images: [range.image],
      sizes: range.sizes,
      colors: range.colors,
    };
  })
);
