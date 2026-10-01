-- Demo catalog: 100 mock products across 10 categories.
-- Photos are real Unsplash images under the standard Unsplash License.
-- This seed is illustrative: lifestyle photos are not photographs of each exact mock SKU.
-- Photo sources:
-- https://unsplash.com/photos/man-in-black-jacket-riding-motorcycle-on-road-during-daytime-9gdsXj5dFSA (Logan Weaver)
-- https://unsplash.com/photos/man-in-black-helmet-riding-motorcycle-8zz3aa0dqHQ (Logan Weaver)
-- https://unsplash.com/photos/person-in-black-leather-boots-riding-motorcycle-on-road-during-daytime-7FkiPsO86U8 (Gijs Coolen)
-- https://unsplash.com/photos/a-woman-in-a-red-jacket-is-sitting-on-a-motorcycle-6laKkLBZn2I (HUSQY _OFFICIAL)
-- https://unsplash.com/photos/a-man-in-a-leather-jacket-and-helmet-on-a-motorcycle-Jreimbcv-xg (Viesturs Broliss)

with catalog(category, names, base_price, image_url, sizes, colors) as (
  values
    ('Jackets', array['RidgeLine Touring Jacket','StormGuard Textile Jacket','Apex Ventilated Jacket','Urban Shield Jacket','TrailFlex Adventure Jacket','Carbon Edge Leather Jacket','RainRoute All-Weather Jacket','Summit Mesh Jacket','NightRide Reflective Jacket','Enduro Pro Jacket'], 1899, 'https://images.unsplash.com/photo-1605927328330-12d03b41225f?auto=format&fit=crop&w=960&q=85', array['S','M','L','XL','XXL'], array['Black','Red','Grey']),
    ('Gloves', array['GripCore Short-Cuff Gloves','RallyGuard Gauntlet Gloves','AeroMesh Summer Gloves','ThermoRide Winter Gloves','ImpactX Knuckle Gloves','TrailPro Enduro Gloves','UrbanFlex Leather Gloves','StormSeal Waterproof Gloves','CarbonPalm Race Gloves','TourFit Touring Gloves'], 499, 'https://images.unsplash.com/photo-1677751808418-47e3ce898fe5?auto=format&fit=crop&w=960&q=85', array['S','M','L','XL'], array['Black','Red','Tan']),
    ('Helmets', array['Apex Full-Face Helmet','Metro Modular Helmet','Velocity Race Helmet','TrailScout Adventure Helmet','Echo Open-Face Helmet','CarbonLite Touring Helmet','NightShift Visor Helmet','JuniorRide Youth Helmet','TrackLine Graphic Helmet','RoadMate Commuter Helmet'], 2199, 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=960&q=85', array['S','M','L','XL'], array['Matte Black','White','Red']),
    ('Boots', array['Metro Touring Boots','IronPeak Adventure Boots','TrackForce Race Boots','TrailCore Enduro Boots','CityGrip Commuter Boots','StormStep Waterproof Boots','RidgeWalker Protective Boots','CarbonFlex Sport Boots','Summit ADV Boots','RoadGuard Short Boots'], 1499, 'https://images.unsplash.com/photo-1582716510825-0ea3f7bd8334?auto=format&fit=crop&w=960&q=85', array['7','8','9','10','11','12'], array['Black','Brown']),
    ('Riding Pants', array['Summit Riding Pants','RidgeLine Textile Pants','Apex Track Pants','UrbanFlex Riding Jeans','TrailGuard Adventure Pants','StormShell Overpants','CarbonKnee Protective Pants','TourRoute All-Weather Pants','EnduroFlex Mesh Pants','RoadCraft Reinforced Jeans'], 1299, 'https://images.unsplash.com/photo-1600497934947-23786a93f382?auto=format&fit=crop&w=960&q=85', array['S','M','L','XL','XXL'], array['Black','Grey','Blue']),
    ('Leather Suits', array['Elite Race Suit','Velocity One-Piece Suit','TrackLine Pro Suit','Apex Two-Piece Suit','CarbonShell Racing Suit','RidgeRunner Leather Suit','StormCircuit Race Suit','RoadCraft Sport Suit','Summit Performance Suit','EnduroShield Leather Suit'], 4999, 'https://images.unsplash.com/photo-1601440497908-ed85798ebbd9?auto=format&fit=crop&w=960&q=85', array['S','M','L','XL'], array['Black','Red','White']),
    ('Base Layers', array['BreatheDry Base Top','ThermoRide Thermal Top','CoolRoute Summer Layer','CoreFlex Compression Top','DryTrack Base Leggings','WinterLine Thermal Set','AirFlow Mesh Layer','RoadSkin Riding Base','Summit Wicking Top','AllSeason Base Layer'], 399, 'https://images.unsplash.com/photo-1653725565489-dfddc2b4cbf0?auto=format&fit=crop&w=960&q=85', array['S','M','L','XL','XXL'], array['Black','Grey']),
    ('Protective Armor', array['ImpactCore Back Protector','FlexGuard Knee Armor','RidgeChest Chest Protector','TrackSafe Elbow Guards','EnduroShield Body Armor','CarbonLite Back Insert','RoadGuard Hip Protectors','Summit Pro Armor Vest','Apex Race Knee Sliders','TrailForce Shoulder Pads'], 299, 'https://images.unsplash.com/photo-1605927328330-12d03b41225f?auto=format&fit=crop&w=960&q=85', array['S','M','L','XL'], array['Black','Red']),
    ('Rainwear', array['StormShell Rain Jacket','DryRoute Rain Pants','AllWeather Suit','RoadMist Waterproof Gloves','CloudBreak Over-Jacket','Monsoon Touring Set','RainLine Boot Covers','TrailDry Packable Shell','AquaGuard Commuter Suit','WetRoad Hi-Vis Jacket'], 599, 'https://images.unsplash.com/photo-1605927328330-12d03b41225f?auto=format&fit=crop&w=960&q=85', array['S','M','L','XL','XXL'], array['Black','Yellow','Red']),
    ('Rider Luggage', array['TrailPack Tail Bag','RoadCase Tank Bag','Summit 30L Pannier','MetroLock Helmet Bag','RidgeLine Roll Bag','TourRoute Saddle Bags','EnduroDry Duffel','Apex Compact Tail Pack','CityRide Leg Bag','LongHaul Top Case'], 699, 'https://images.unsplash.com/photo-1614771161300-0b7084bd5cd6?auto=format&fit=crop&w=960&q=85', array['One size'], array['Black','Grey'])
), products as (
  select
    md5(lower(c.category || ':' || item.name))::uuid as id,
    item.name,
    item.name || ' from the ' || c.category || ' collection, selected for comfort, durability, and everyday riding protection.' as description,
    c.base_price + (item.ordinality - 1) * 85 as price,
    case when (item.ordinality - 1) % 4 = 0 then round((c.base_price + (item.ordinality - 1) * 85) * 0.9, 2) else null end as discount_price,
    c.category,
    6 + (((item.ordinality - 1) * 7 + c.base_price) % 20)::integer as stock,
    item.ordinality <= 2 as featured,
    (item.ordinality - 1) % 3 = 0 as is_new,
    item.ordinality <= 2 as is_best_seller,
    jsonb_build_array(c.image_url) as images,
    c.sizes,
    c.colors
  from catalog c
  cross join lateral unnest(c.names) with ordinality as item(name, ordinality)
)
insert into public.products (
  id, name, description, price, discount_price, category, stock,
  featured, is_new, is_best_seller, images, sizes, colors
)
select
  id, name, description, price, discount_price, category, stock,
  featured, is_new, is_best_seller, images, sizes, colors
from products
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  discount_price = excluded.discount_price,
  category = excluded.category,
  featured = excluded.featured,
  is_new = excluded.is_new,
  is_best_seller = excluded.is_best_seller,
  images = excluded.images,
  sizes = excluded.sizes,
  colors = excluded.colors;
