
## برومنت توليد صور الفنجان 360° (PNG شفاف)
### 1. البرومنت الرئيسي (Base Prompt) — استخدمه مرة واحدة مع Reference أو Seed ثابت

A photorealistic traditional Egyptian Turkish coffee cup (finjan) and its matching small hammered brass saucer, filled to the rim with freshly brewed very dark Turkish coffee topped with a thick, creamy golden-brown foam (köpük). The cup has a slightly curved spoutless body, narrow base, rounded rim, and a classic Middle Eastern finjan shape. The saucer is thin, slightly domed/hammered brass with a warm copper-gold patina. 
Soft neutral studio lighting: directional key light from above-front-left (approx. 40–45°), soft fill to lift the inner rim, subtle cool rim light for separation, with gentle specular highlights on the brass. No harsh shadows, no colored gels. Completely solid black (#000000) background with 0% ambient environment — render on pure black to preserve transparency cleanly, or output with full alpha transparency (PNG). No table, no ground plane, no shadow catcher, no cast shadows on background, no props, no text, no watermark, no logo. Product still life, centered perfectly in frame, object occupies ~80–85% of the square frame. Use 85mm lens look (slightly compressed), f/8–f/11, photorealistic materials (glazed ceramic cup body with subtle micro-sheen, realistic liquid surface with micro-bubbles in foam, accurate PBR brass). Keep materials, colors, proportions, fill level, foam shape, lighting direction and intensity 100% identical across all angles.

### 2. برومنت لكل زاوية (Turntable) — استخدمه لكل صورة مع تغيير N من 1 إلى 36

Camera orbits the object around its vertical axis by exactly (N×10) degrees for a full 360° turntable (equirectangular horizontal orbit, Y-axis rotation only). The object remains completely static, locked in position and centered. Only the camera viewing angle changes. Maintain identical elevation angle 18° above the equator (three-quarter top view looking slightly down at the cup) and identical distance/focal length. Preserve perfect consistency (seed locked, no compositional drift). Solid black background, output as PNG with alpha channel (transparent background). No ground contact shadow, no reflection on invisible floor. Photorealistic, razor-sharp, clean product render.

### 3. جدول الزوايا (36 صورة كل 10°)
cup_01.png → 0°  
cup_02.png → 10°  
cup_03.png → 20°  
cup_04.png → 30°  
cup_05.png → 40°  
cup_06.png → 50°  
cup_07.png → 60°  
cup_08.png → 70°  
cup_09.png → 80°  
cup_10.png → 90°  
cup_11.png → 100°  
cup_12.png → 110°  
cup_13.png → 120°  
cup_14.png → 130°  
cup_15.png → 140°  
cup_16.png → 150°  
cup_17.png → 160°  
cup_18.png → 170°  
cup_19.png → 180°  
cup_20.png → 190°  
cup_21.png → 200°  
cup_22.png → 210°  
cup_23.png → 220°  
cup_24.png → 230°  
cup_25.png → 240°  
cup_26.png → 250°  
cup_27.png → 260°  
cup_28.png → 270°  
cup_29.png → 280°  
cup_30.png → 290°  
cup_31.png → 300°  
cup_32.png → 310°  
cup_33.png → 320°  
cup_34.png → 330°  
cup_35.png → 340°  
cup_36.png → 350°

### 4. متطلبات الإخراج
- Square: 1:1 (1000×1000 أو 1500×1500) — أنسب 1500×1500
- Format: PNG with alpha (شفاف 100%) — لو الموديل ما يقدرش PNG شفاف، استخدم خلفية خضراء (#00FF00) موحدة ونقولك
- No shadows, no environment, black bg
- تثبيت كامل بين الصور (consistency lock/seed ثابت + reference image من الصورة الأولى)
