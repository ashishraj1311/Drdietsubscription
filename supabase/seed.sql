-- Dr Diet — catalog seed (mirrors src/lib/mock/seed.ts).
-- Idempotent: re-runnable via upsert. Run after 0001_init.sql.
-- Constraints preserved: INR-only prices, NO beef anywhere.

-- Allergens ------------------------------------------------------------------
insert into public.allergens (id, name, icon) values
  ('dairy','Dairy','🥛'),
  ('gluten','Gluten','🌾'),
  ('nuts','Nuts','🥜'),
  ('soy','Soy','🫛'),
  ('egg','Egg','🥚'),
  ('fish','Fish','🐟'),
  ('shellfish','Shellfish','🦐'),
  ('sesame','Sesame','🌰')
on conflict (id) do update set name = excluded.name, icon = excluded.icon;

-- Meals ----------------------------------------------------------------------
insert into public.meals
  (id, name, slot, calories, protein_g, carbs_g, fat_g, protein_option, allergen_ids, diet_types, emoji, description) values
  ('m-poha','Veggie Poha & Sprouts','breakfast',320,14,48,8,'lentil',array['nuts'],array['veg','vegan','eggetarian'],'🍚','Flattened rice with peanuts, peas and a side of moong sprouts.'),
  ('m-eggwhite','Egg White Masala Omelette','breakfast',290,26,12,14,'egg',array['egg'],array['non_veg','eggetarian'],'🍳','Four-egg-white omelette with onion, tomato and multigrain toast.'),
  ('m-tofuscramble','Turmeric Tofu Scramble','breakfast',300,22,20,14,'tofu',array['soy'],array['vegan','veg'],'🍲','Spiced tofu scramble with peppers and a whole-wheat roti.'),
  ('m-oats','Protein Overnight Oats','breakfast',350,24,45,9,'paneer',array['dairy','nuts'],array['veg','eggetarian'],'🥣','Rolled oats set with curd, whey, chia and almond slivers.'),
  ('m-chickenbowl','Grilled Chicken Quinoa Bowl','lunch',560,45,52,16,'chicken',array[]::text[],array['non_veg'],'🥗','Herbed grilled chicken over quinoa, greens and roasted veg.'),
  ('m-paneerbowl','Paneer Power Bowl','lunch',520,38,46,20,'paneer',array['dairy'],array['veg','eggetarian'],'🥘','Tandoori paneer, brown rice, rajma and a mint raita.'),
  ('m-fishrice','Lemon Herb Fish & Rice','lunch',540,42,50,18,'fish',array['fish'],array['non_veg'],'🐟','Pan-seared basa, lemon-herb sauce, red rice and beans.'),
  ('m-rajmabowl','Rajma Chawal Protein Bowl','lunch',500,24,72,12,'lentil',array[]::text[],array['veg','vegan','eggetarian'],'🍛','Slow-cooked kidney beans, brown rice, salad and papad.'),
  ('m-soyabowl','Soya Chaap Buddha Bowl','lunch',480,34,44,16,'soya',array['soy'],array['vegan','veg'],'🥙','Marinated soya chaap, millet, hummus and pickled veg.'),
  ('m-sprout','Sprout & Corn Chaat','evening_snack',180,11,26,4,'lentil',array[]::text[],array['veg','vegan','eggetarian'],'🥗','Moong sprouts, sweet corn, onion and tangy chutney.'),
  ('m-greekcup','Curd & Berry Protein Cup','evening_snack',200,18,20,5,'paneer',array['dairy'],array['veg','eggetarian'],'🫐','Hung curd, whey, berries and toasted seeds.'),
  ('m-chickenwrap','Chicken Tikka Mini Wrap','evening_snack',240,22,22,8,'chicken',array['gluten'],array['non_veg'],'🌯','Chicken tikka in a whole-wheat mini wrap with slaw.'),
  ('m-chickenroast','Herb Roast Chicken & Veg','dinner',520,46,30,22,'chicken',array[]::text[],array['non_veg'],'🍗','Roast chicken, sweet potato mash and sautéed greens.'),
  ('m-paneertikka','Paneer Tikka & Millet Khichdi','dinner',470,32,42,18,'paneer',array['dairy'],array['veg','eggetarian'],'🍢','Char-grilled paneer tikka with a light millet khichdi.'),
  ('m-tofustir','Tofu & Veg Stir Fry','dinner',430,28,40,15,'tofu',array['soy','sesame'],array['vegan','veg'],'🍜','Wok-tossed tofu, seasonal veg and soba in a light sauce.'),
  ('m-dallentil','Dal & Multigrain Roti Thali','dinner',450,22,58,12,'lentil',array['gluten'],array['veg','vegan','eggetarian'],'🍽️','Yellow dal, two multigrain rotis, sabzi and salad.')
on conflict (id) do update set
  name = excluded.name, slot = excluded.slot, calories = excluded.calories,
  protein_g = excluded.protein_g, carbs_g = excluded.carbs_g, fat_g = excluded.fat_g,
  protein_option = excluded.protein_option, allergen_ids = excluded.allergen_ids,
  diet_types = excluded.diet_types, emoji = excluded.emoji, description = excluded.description;

-- Plans ----------------------------------------------------------------------
insert into public.plans
  (id, name, tagline, diet_type, goal, description, macro_protein_pct, macro_carb_pct, macro_fat_pct,
   calories_per_day, price_per_day_inr, sample_meal_ids, rating, review_count, emoji, highlights) values
  ('p-lean','Lean Machine','High-protein, calorie-smart','non_veg','lose_weight',
   'A lean, high-protein plan built for a calorie deficit without feeling starved. Chicken, fish and egg forward.',
   40,35,25,1500,320,array['m-eggwhite','m-chickenbowl','m-chickenwrap','m-fishrice'],4.7,214,'🍗',
   array['45g+ protein/meal','Calorie controlled','Chicken & fish']),
  ('p-muscle','Muscle Fuel','Surplus calories, max protein','non_veg','gain_muscle',
   'Engineered for muscle gain with a clean calorie surplus and heavy protein loading across four meals.',
   35,45,20,2400,420,array['m-oats','m-chickenbowl','m-greekcup','m-chickenroast'],4.8,176,'💪',
   array['2400 kcal/day','4 meals','Bulk-friendly']),
  ('p-balanced-veg','Balanced Veg','Wholesome vegetarian everyday','veg','maintain',
   'A balanced vegetarian plan with paneer, dal and millets to maintain weight and eat clean daily.',
   30,45,25,1800,300,array['m-poha','m-paneerbowl','m-sprout','m-paneertikka'],4.6,298,'🥗',
   array['Paneer & dal','Balanced macros','Everyday veg']),
  ('p-plant','Plant Powered','100% vegan, protein-rich','vegan','eat_healthier',
   'Fully plant-based with tofu, soya and legumes — high protein, zero dairy, zero egg.',
   28,47,25,1700,310,array['m-tofuscramble','m-soyabowl','m-sprout','m-tofustir'],4.5,132,'🌱',
   array['Vegan','Tofu & soya','Dairy-free']),
  ('p-egg-fit','Egg-Fit Balance','Eggetarian, gym-ready','eggetarian','gain_muscle',
   'Vegetarian plus eggs — a flexible, gym-ready plan with paneer, eggs and lentils.',
   34,44,22,2000,340,array['m-eggwhite','m-paneerbowl','m-greekcup','m-dallentil'],4.6,154,'🥚',
   array['Egg + veg','2000 kcal','Gym-ready'])
on conflict (id) do update set
  name = excluded.name, tagline = excluded.tagline, diet_type = excluded.diet_type, goal = excluded.goal,
  description = excluded.description, macro_protein_pct = excluded.macro_protein_pct,
  macro_carb_pct = excluded.macro_carb_pct, macro_fat_pct = excluded.macro_fat_pct,
  calories_per_day = excluded.calories_per_day, price_per_day_inr = excluded.price_per_day_inr,
  sample_meal_ids = excluded.sample_meal_ids, rating = excluded.rating,
  review_count = excluded.review_count, emoji = excluded.emoji, highlights = excluded.highlights;

-- Coupons --------------------------------------------------------------------
insert into public.coupons (code, label, discount_type, value, is_first_time_buyer_only, min_order_inr) values
  ('WELCOME150','₹150 off your first order','flat_inr',150,true,null),
  ('FIT10','10% off any plan','percent',10,false,1000),
  ('TRYME','₹100 off the trial pack','flat_inr',100,false,null)
on conflict (code) do update set
  label = excluded.label, discount_type = excluded.discount_type, value = excluded.value,
  is_first_time_buyer_only = excluded.is_first_time_buyer_only, min_order_inr = excluded.min_order_inr;

-- Reviews --------------------------------------------------------------------
insert into public.reviews (id, plan_id, user_name, rating, comment, created_at, goal_tag, approved) values
  ('r1','p-lean','Aditya S.',5,'Down 4kg in 6 weeks without ever feeling hungry. The chicken bowls are genuinely restaurant-quality.','2026-06-18','Lose Weight',true),
  ('r2','p-muscle','Karthik R.',5,'Muscle Fuel made bulking effortless — I stopped meal-prepping on Sundays entirely.','2026-06-30','Gain Muscle',true),
  ('r3','p-balanced-veg','Priya M.',5,'As a vegetarian I finally hit my protein goals. Paneer tikka dinner is chef''s kiss.','2026-07-02','Maintain',true),
  ('r4','p-plant','Neha V.',4,'Great vegan variety. Would love even more dessert options, but the tofu stir fry is a staple now.','2026-07-10','Eat Healthier',true),
  ('r5',null,'Rahul T.',5,'Tried the 3-meal trial before committing — sold me instantly. No other brand let me test first.','2026-07-14','Trial',true),
  ('r6','p-egg-fit','Sneha K.',4,'Egg-Fit is perfectly portioned for my gym routine. Delivery is always on time in Powai.','2026-07-19','Gain Muscle',true),
  ('r7','p-lean','Manav D.',5,'Billing was crystal clear — I knew exactly what renews and what doesn''t. Refreshing.','2026-07-21','Lose Weight',true)
on conflict (id) do update set
  plan_id = excluded.plan_id, user_name = excluded.user_name, rating = excluded.rating,
  comment = excluded.comment, created_at = excluded.created_at, goal_tag = excluded.goal_tag,
  approved = excluded.approved;
