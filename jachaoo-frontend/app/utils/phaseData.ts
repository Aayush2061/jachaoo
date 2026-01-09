const bullet = "•";
export const phaseData = {
  "Menstrual Phase": {
    Food: {
      categories: [
        {
          name: "Iron Rich Foods",
          description:
            "Especially focuses on maintaining the iron lost due to bleeding and prevents anemia.",
          items: [
            "Spinach",
            "Lentils",
            "Beets",
            "Egg yolks",
            "Liver",
            "Gundruk",
            "Black chana",
            "Niuro",
            "Mutton",
            "Bhatmas",
          ],
          tip: "Pair foods with tomatoes or oranges for better iron absorption.",
        },
        {
          name: "Warm Foods",
          description: "Boost low energy and reduce cravings.",
          items: [
            "Khichadi (Mung dal + rice)",
            "Chicken or Bone soups",
            "Ginger tea",
            "Turmeric milk",
            "Milk + rice",
            "Vegetable soup",
          ],
          tip: "Food cooked in small amounts of ghee.",
        },
        {
          name: "Anti-Inflammatory Foods",
          description: "Reduces cramps and bloating.",
          items: [
            "Ginger",
            "Turmeric",
            "Cumin (Jeera)",
            "Fish",
            "Berries (Strawberries or Blueberries)",
          ],
          tip: null,
        },
        {
          name: "Hydrating Foods",
          description:
            "Maintain water and blood volume. Dehydration worsens cramps and fatigue.",
          items: [
            "Cucumber",
            "Lemon water",
            "Watermelon",
            "Oranges",
            "Coconut water",
            "Soups",
            "Fruits (High in water + fiber)",
          ],
          tip: null,
        },
        {
          name: "Mood Boosting Foods",
          description: "Support good moods.",
          items: [
            "Banana",
            "Dark chocolate",
            "Milk + turmeric",
            "Nuts (almonds, walnuts)",
            "Pumpkin seeds",
          ],
          tip: null,
        },
      ],
      generalTips: [
        "Avoid salty, processed, fried foods.",
        "Cut down on caffeine.",
        "Reduce sugary sweets; opt for warm water or herbal teas.",
        "Avoid cold drinks and ice creams—they worsen cramps.",
      ],
    },
    Exercise: [
      // ==================== YOGA POSES ====================
      { type: "header", text: "Yoga Poses" },

      {
        type: "exercise",
        category: "yoga",
        name: "Balasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381250/Balasana_gjls9b.png",
        },
        steps: [
          "1. Sit on your knees, feet together",
          "2. Bend forward slowly, chest between thighs",
          "3. Stretch hands forward or keep near feet",
          "4. Forehead on floor, breathe slowly",
          "5. Hold for 2-3 minutes",
        ],
        benefits: ["Relieves lower back pain, calms mind"],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "Cat-Cow Stretch",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381254/cat-cow_vrdrrf.png",
        },
        steps: [
          "1. Get on the pose",
          `${bullet}  Cow Pose`,
          "       Take a breath in, lift your head up, and let your \t\t\t\tbelly drop down",
          `${bullet}  Cat Pose`,
          "       Breathe out, round your back up like a scared \t\t\tcat, and look at your belly",
          "2. Do this slowly 5–10 times, breathing with each move.",
        ],
        benefits: ["Stretches spine gently and improves flow"],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "Viparita Karani",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381275/vparita-karani_tqltel.png",
        },
        steps: [
          "1. Sit near a wall.",
          "2. Lie down and lift your legs up, placing them straight on the wall.",
          "3. Let your hands rest by your side.",
          "4. Close your eyes and relax.",
          "5. Stay like this for 5–10 minutes.",
        ],
        benefits: ["Reduces fatigue, improves circulation"],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "Supta Baddha Konasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381265/supta-buddha-konasana_qd3nnt.png",
        },
        steps: [
          "1. Lie down on your back.",
          "2. Join your feet together, and let your knees fall open like butterfly wings.",
          "3. Put your hands on your belly or sides.",
          "4. Breathe gently and relax for 5–10 minutes.",
        ],
        benefits: ["Reduces cramps"],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "Apanasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381250/apanasana_nvanhi.png",
        },
        steps: [
          "1. Lie down on your back.",
          "2. Bring one knee close to your chest and hold it with both hands.",
          "3. Breathe slowly for about 5 -10 breaths. Then switch legs.",
          "4. You can also bring both knees together to your chest.",
        ],
        benefits: ["Aids digestion, eases bloating"],
      },

      // ============= MEDITATION & BREATHING =============
      { type: "header", text: "Meditation & Breathing" },

      {
        type: "exercise",
        category: "meditation",
        name: "Anulom Vilom",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381246/anulom_vilom_c62pbc.jpg",
        },
        steps: [
          "1. Sit comfortably with your back straight.",
          "2. Close your eyes and relax your face.",
          "3. Use your **right thumb** to **close** your right nostril.",
          "4. Breathe in slowly through your left nostril.",
          "5. Now close your left nostril with your ring finger.",
          "6. Open your right nostril and breathe out slowly.",
          "7. Now breathe in from the right nostril",
          "8. Close it, and breathe out from the left nostril.",
          "9. This is one full round.",
          "10. Repeat slowly for 10-15 rounds, focusing on your breath.",
        ],
        benefits: ["Balances hormones, calms mood"],
      },
      {
        type: "exercise",
        category: "meditation",
        name: "Deep Belly Breathing",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381254/deep-belly-breathing_gst05h.png",
        },
        steps: [
          "1. Sit or lie down comfortably.",
          "2. Place one hand on your belly and one on your chest.",
          "3. Breathe in slowly through your nose.",
          "    – Feel your belly rise like a balloon.",
          "4. Breathe out slowly through your mouth.",
          "    – Feel your belly fall.",
          "5. Keep your shoulders relaxed.",
          "6. Do this slowly for 5–10 minutes.",
          "    – Focus only on the belly moving, not the chest.",
        ],
        benefits: ["Calms nervous system, relieves cramps"],
      },
      {
        type: "exercise",
        category: "meditation",
        name: "Womb Meditation",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381277/womb-meditation_vr9nma.png",
        },
        steps: [
          "1. Sit or lie down in a quiet place.",
          "2. Place both hands on your womb (below the belly button).",
          "3. Keep your hands there the whole time.",
          "4. Close your eyes and take a few deep breaths.",
          "5. Focus on the warmth of your hands on your womb.",
          "6. Imagine a soft, glowing light in that space.",
          "7. Silently say kind words, like:",
          "    “I am safe. I am healing. I am whole.”",
          "8  Stay in this feeling for 5–10 minutes or longer.",
          "9  End by slowly opening your eyes and taking a deep breath.",
        ],
        benefits: ["Promotes physical, emotional and spiritual healing"],
      },

      // ==================== RESTING ====================
      { type: "header", text: "Resting" },
      {
        type: "text",
        content: "- Use warm water bottle on abdomen or back",
      },
      {
        type: "text",
        content:
          "- Listen to calming music, mantra, or guided sleep meditations",
      },
      {
        type: "text",
        content: "- For relaxation, practice Shavasana",
      },

      // ============== LIGHT EXERCISES ==============
      { type: "header", text: "Light Exercises" },
      {
        type: "text",
        content: "- Slow walking",
      },
      {
        type: "text",
        content: "- Gentle stretching",
      },
      {
        type: "text",
        content: "- Massage",
      },
    ],
    Focus: {
      categories: [
        {
          name: "Living",
          items: [
            "This is your natural 'winter'. Sleep more, take short naps, reduce social obligations",
            "Don't overthink anything that's not working for you — let it go",
            "Make fewer decisions and enjoy personal time",
            "Create a calm vibe: use quiet spaces, soft lighting, and slow music",
            "Restore self-confidence. Do tasks that make you feel joy and comfort",
          ],
        },
        {
          name: "Working",
          items: [
            "Do tasks that require less collaboration and more deep thinking",
            "Good time for writing, journaling, and visioning future ideas",
            "Communicate if you need quiet time or personal space",
            "Reflect on past work and refine your plans",
            "Take care of your body; it's okay to say no to invitations",
          ],
        },
      ],
      tips: [], // No additional tips in this section
    },
    Love: {
      categories: [
        {
          name: "Relationships",
          items: [
            "In this phase, you're more sensitive and emotionally raw",
            "You might not feel like texting or going out — let friends/partner know you're recharging",
            "If in a romantic relationship, small gestures like a hug or cup of tea can be deeply nourishing",
            "You may feel more emotionally intense — give yourself space before reacting",
            "Reflect on whether your relationships make you feel strong and supported",
          ],
        },
        {
          name: "Sex Status",
          items: [
            "It's your time — if you don't feel like engaging in sex (solo or with a partner), take a break",
            "Low sex drive is normal due to cramps or fatigue",
            "To stay close without intercourse, try cuddling, massage, or holding hands in a warm space",
          ],
        },
      ],
      tips: [], // No additional tips in this section
    },
  },
  "Follicular Phase": {
    Food: {
      categories: [
        {
          name: "Brain-Boosting & Energy Foods",
          description: "Supports brain focus and stable blood sugar.",
          items: [
            "Eggs",
            "Avocado",
            "Oats + nuts",
            "Grains (millet, brown rice, barley)",
            "Banana",
            "Spinach",
            "Pumpkin seeds",
            "Peanut Butter",
          ],
          tip: null,
        },
        {
          name: "Hormone Supporting Foods",
          description:
            "Helps rising estrogen level naturally and balances rising energy.",
          items: [
            "Chana",
            "Sprouted lentils (soaked dal)",
            "Moong dal",
            "Gundruk",
            "Yogurt (Dahi)",
            "Cauliflower, Cabbage, Broccoli",
            "Fish",
            "Apples, Papaya",
            "Berries (Strawberry)",
          ],
          tip: null,
        },
        {
          name: "Hydrating Foods",
          description: "Body feels fresher and more energetic.",
          items: [
            "Lemon + honey water",
            "Cucumber",
            "Mint",
            "Coconut water",
            "Citrus fruits",
            "Fruits (Apples, Oranges, Pears)",
          ],
          tip: null,
        },
      ],
      generalTips: [
        "Continue warm teas with herbs like ginger, tulsi, mint.",
        "Avoid oily and fried foods.",
        "Have fruits daily or frequently.",
      ],
    },
    Exercise: [
      // ==================== YOGA POSES ====================
      { type: "header", text: "Yoga Poses" },

      {
        type: "exercise",
        category: "yoga",
        name: "Adho Mukha Svanasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381248/adho-mukha-svanasana_wgh4gw.png",
        },
        steps: [
          "1. Start by placing your hands and knees on the floor.",
          "2. Curl your toes under and slowly lift your hips up toward the sky.",
          "3. Try to make your body look like an upside-down “V”.",
          "4. Keep your head between your arms, back straight.",
          "5. Hold for 30 sec–1 min.",
          "6. Gently lower down and rest.",
          "7. Repeat 2–3 times.",
        ],
        benefits: [
          "Improves blood flow and focus.",
          "Stretches spine, legs, and shoulders.",
        ],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "Virabhadrasana I",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381272/virabhadrasana_x8k5b5.png",
        },
        steps: [
          "1. Step your left leg back, bend the right knee",
          "2. Raise both arms straight up, face forward",
          "3. Hold for 20–30 seconds",
          "4. Come back to standing and switch legs",
          "5. Repeat the same steps on the other side",
          "6. Repeat 2-3 times per leg",
        ],
        benefits: ["Improves posture and focus", "Builds posture and focus"],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "Ustrasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381269/utkatasana_ngi4hd.png",
        },
        steps: [
          "1. Kneel down, knees hip-width apart",
          "2. Place hands on lower back",
          "3. Slowly lean back and look up",
          "4. If comfortable, hold your heels",
          "5. Hold for 15–30 seconds and come up gently",
          "6. Repeat 2 to 3 times",
        ],
        benefits: [
          "Increase energy and improves posture.",
          "Stretches hips, belly and chest",
        ],
        tips: "Do not stretch too hard and do this after some warmups",
      },
      {
        type: "exercise",
        category: "yoga",
        name: "Setu Bandhasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381262/setu-bandhasana_hxsr2l.png",
        },
        steps: [
          "1. Lie on your back, bend your knees",
          "2. Place feet flat on the floor, arms by your side",
          "3. Press feet down and lift your hips up",
          "4. Hold for 30 sec–1 min, then slowly come down",
          "5. Breathe slowly",
          "6. Repeat for 2-3 times",
        ],
        benefits: [
          "Strengthens back, hips and thighs.",
          "Opens hips and heart area",
        ],
      },

      // ============= MEDITATION & BREATHING =============
      { type: "header", text: "Meditation & Breathing" },

      {
        type: "exercise",
        category: "meditation",
        name: "Kapalbhati",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381256/kapalbhati_ojz3ss.png",
        },
        steps: [
          "1. Sit comfortably with a straight back",
          "2. Take a deep breath in",
          "3. Forcefully exhale through your nose by pulling your belly in",
          "4. Let the inhale happen naturally",
          "5. Repeat this fast exhale-inhale cycle for about 5 minutes",
        ],
        benefits: [
          "Boosts metabolism and clears toxins from body",
          "Best in morning time on empty stomach",
        ],
        precautions: "Avoid during menstruation or if you have BP or hernia",
      },
      {
        type: "exercise",
        category: "meditation",
        name: "Bhramari",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381253/bhramari_jcrvns.png",
        },
        steps: [
          "1. Sit comfortably with your eyes closed",
          "2. Inhale deeply through your nose",
          "3. While exhaling, make a soft humming sound like 'mmmmmm'",
          "4. Optionally, use your thumbs to gently close your ears for deeper effect",
          "5. Repeat for 20–30 seconds, 5 to 7 times",
        ],
        benefits: ["Calms nervous system", "Reduces stress and improves sleep"],
      },
      {
        type: "exercise",
        category: "meditation",
        name: "Visualization Meditation",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381275/visualization-meditation_ufhe4p.png",
        },
        steps: [
          "1. Sit comfortably in a quiet, peaceful place",
          "2. Close your eyes and take slow, deep breaths",
          "3. Imagine things that make you happy and what you love",
          "4. Stay with this positive image for 5 to 10 minutes",
        ],
        benefits: [
          "Best on empty stomach",
          "Builds self-confidence and boosts creativity and focus",
        ],
      },
    ],
    Focus: {
      categories: [
        {
          name: "Living",
          items: [
            "Your energy starts to rise—it's time to rejoin life with creativity and motivation",
            "Try something new: a hobby, skill, or event",
            "Best time to plan dreams and create strategies",
            "Explore new things, say yes to new opportunities",
            "Your brain craves freshness—do cleaning or reset your space",
          ],
        },
        {
          name: "Working",
          items: [
            "You're mentally alert and energetic—perfect for work and creative thinking",
            "Continue deep work with boosted energy",
            "Communication is strong—engage in teamwork",
            "Great time for interviews, meetings, workshops",
            "Start new projects, pitch ideas, experiment freely",
          ],
        },
      ],
      tips: [], // No general tips in this example
    },
    Love: {
      categories: [
        {
          name: "Relationships",
          items: [
            "At this phase, you are more playful, laughing, meeting new people and being more social",
            "Reconnect with friends, go on dates, plan group events",
            "This is the great time to resolve the issues as you are mentally calm and emotionally balanced",
            "As your self confidence rises, letting people love you recharge you emotionally",
            "If single, it's a great time to meet new people or go on dates",
          ],
        },
        {
          name: "Sex Status",
          items: [
            "Your sex drive is increasing during this phase",
            "Your skin glows, energy returns and feel more attractive and you want to feel bolder",
            "Try new things in relationship, communicate with your partner",
            "Express yourself. Go for walk, teasing, cuddling deepens closeness with your partner",
          ],
        },
      ],
      tips: [], // No general tips in this example
    },
  },
  "Ovulatory Phase": {
    Food: {
      categories: [
        {
          name: "Cooling & Anti-Inflammatory Foods",
          description:
            "Helps regulate body temperature and reduce inflammation during ovulation.",
          items: [
            "Cucumber",
            "Watermelon",
            "Yogurt / Curd",
            "Lemon water",
            "Mint (Pudina)",
            "Citrus fruit (Oranges)",
            "Amala juice",
            "Fenugreek water (Methi pani)",
          ],
          tip: null,
        },
        {
          name: "Fertility Boosting Foods",
          description: "Supports reproductive health and hormone balance.",
          items: [
            "Eggs",
            "Pumpkin seeds",
            "Pomegranate",
            "Cauliflower / Cabbage",
            "Green leafy vegetables",
            "Avocado",
            "Chicken",
            "Gundruk",
            "Mushrooms",
            "Dal (Mung dal / Musuro dal)",
          ],
          tip: null,
        },
        {
          name: "Higher Fiber Foods",
          description: "Supports digestion and helps regulate estrogen levels.",
          items: [
            "Apple",
            "Pear (Nashpati)",
            "Lentils (Rahar / Musuro dal)",
            "Millet",
            "Barley / Brown rice",
            "Corn flour",
          ],
          tip: null,
        },
      ],
      generalTips: [
        "Stay hydrated with herbal teas (tulsi + ginger), lemon or mint water.",
        "Avoid deep-fried and spicy foods.",
        "Include foods like gundruk and yogurt.",
        "Avoid sugary drinks and excess tea/coffee.",
      ],
    },
    Exercise: [
      // ==================== YOGA POSES ====================
      { type: "header", text: "Yoga Poses" },

      {
        type: "exercise",
        category: "yoga",
        name: "Bhujangasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381251/bhujangasana_l53trm.png",
        },
        steps: [
          "1. Lie down on your stomach",
          "2. Put your hands under your shoulders",
          "3. Slowly breathe in and lift your chest up",
          "4. Use your back strength, not your hands",
          "5. Look up and stay like that for 20–30 seconds",
          "6. Come down slowly",
          "7. Do this 3–4 times",
        ],
        benefits: [
          "Boosts energy and mood",
          "Open heart and improve spinal flexibility",
        ],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "Dhanurasana (Bow pose)",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381256/dhanurasana_luapc9.png",
        },
        steps: [
          "1. Lie on your stomach",
          "2. Bend your knees and hold your ankles with your hands",
          "3. Breathe in and lift your chest and legs together",
          "4. Your body will look like a bow",
          "5. Stay like that for 15–30 seconds",
          "6. Do this 2–3 times",
        ],
        benefits: [
          "Stimulates ovaries and uterus",
          "Relives mild back pain and menstrual discomfort",
        ],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "Utkatasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381269/utkatasana_ngi4hd.png",
        },
        steps: [
          "1. Stand straight with your feet a little apart",
          "2. Raise both hands straight up",
          "3. Now bend your knees like you are sitting on a chair",
          "4. Keep your back straight",
          "5. Stay like that for 30–40 seconds",
          "6. Do this 3 times",
        ],
        benefits: [
          "Provide strength to thighs, hips and spine",
          "Boost energy and stamina",
        ],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "Plank Pose",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381263/plank-pose_bviii7.png",
        },
        steps: [
          "1. Lie on your stomach and then lift your body on your hands and toes",
          "2. Keep your body straight like a line",
          "3. Look down, tighten your stomach",
          "4. Stay like that for 30–60 seconds",
          "5. Do this 2 times",
        ],
        benefits: [
          "provide strength to arms, shoulders and legs",
          "Improves posture and boost body",
        ],
      },

      // ============= MEDITATION & BREATHING =============
      { type: "header", text: "Meditation & Breathing" },

      {
        type: "exercise",
        category: "meditation",
        name: "Bhramari",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381253/bhramari_jcrvns.png",
        },
        steps: [
          "1. Sit in a quiet place, cross your legs and keep your back straight",
          "2. Close your eyes and relax",
          "3. Take a deep breath in through your nose",
          "4. While breathing out, make a soft humming sound like 'mmmmmm...' (like a bee)",
          "5. You can also gently close your ears with your thumbs and rest fingers on your forehead for deeper focus",
          "6. Feel the vibration in your head and chest",
          "7. Do this for 20–30 seconds",
          "8. Repeat 5–7 times",
        ],
        benefits: ["Calms nervous system", "Reduces stress and improves sleep"],
      },
      {
        type: "exercise",
        category: "meditation",
        name: "Chandra Bhedana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381246/anulom_vilom_c62pbc.jpg",
        },
        steps: [
          "1. Sit comfortably with your back straight",
          "2. Use your right hand to close your right nostril with your thumb",
          "3. Slowly breathe in through your left nostril",
          "4. Hold the breath for a few seconds (as per your comfort)",
          "5. Now, close the left nostril with your ring finger and breathe out through the right nostril",
          "6. Repeat: Inhale again through the left nostril, exhale through the right nostril",
          "7. Continue this for about 3–5 minutes",
        ],
        benefits: [
          "Balance high hormonal energy during ovulation",
          "Cools down the body",
        ],
      },

      // ============== OTHER EXERCISES ==============
      { type: "header", text: "Other Exercises" },
      {
        type: "text",
        content: "- Running, Swimming, Cycling for 20-40 minutes",
      },
      {
        type: "text",
        content:
          "- You can go for intense exercise like jumping, squats, climbing",
      },
      {
        type: "text",
        content: "- You can go for group classes like Dance and Zumba",
      },
    ],
    Focus: {
      categories: [
        {
          name: "Living",
          items: [
            "This is the time when you are glowing, sociable and very confident",
            "Go out, host events, meet new people",
            "Try new things: dancing, hosting, speaking and expanding network",
            "Dress up in ways where you boost your self image",
            "Your skin glows up and posture improve",
          ],
        },
        {
          name: "Working",
          items: [
            "You are at your peak mental sharpness and social fluency",
            "Ideal time for leadership, public speaking, and collaboration",
            "Great time for critical work and showing your real ability",
            "Best phase for brainstorming ideas and initiating projects",
            "In this phase your brain wants interaction rather than silent focus",
            "This is your superwoman work phase",
          ],
        },
      ],
      tips: ["Avoid solo deep work like heavy research now"],
    },
    Love: {
      categories: [
        {
          name: "Relationships",
          items: [
            "In this phase, hormones increase confidence, affection and emotional openness",
            "Go out talk to people, organize gatherings",
            "Its great time to resolve past issues calmly with partner, friends, family",
            "In this phase you are more open and flirty so you can express feelings or take the lead in romance",
            "Perfect time for dating, meetups and explore new social circles",
          ],
        },
        {
          name: "Sex Status",
          items: [
            "Hormones work together in this phase increasing the sex drive",
            "You can plan a romantic evening or weekend",
            "Show slow and emotional affection towards the partner",
            "Its great time to have open communication like sharing your preferences with your partner",
            "This is the phase to explore the pleasure for yourself",
          ],
        },
      ],
      tips: [], // No general tips in this example
    },
  },
  "Luteal Phase": {
    Food: {
      categories: [
        {
          name: "Warming & Comforting Foods",
          description:
            "Relax the nervous system, improve digestion and make you calm.",
          items: [
            "Warm Soups (Dal soup, Bone soup)",
            "Sweet Potato",
            "Turmeric milk",
            "Banana",
            "Ginger tea",
            "Brown rice",
            "Vegetables with ghee (carrots, beans)",
            "Cumin water (Jeera pani)",
          ],
          tip: null,
        },
        {
          name: "Hormone Supporting Foods",
          description:
            "Help produce progesterone, balance mood swings and energy.",
          items: [
            "Eggs",
            "Fatty Fish",
            "Chicken",
            "Avocado",
            "Sesame seeds (Til)",
            "Paneer",
            "Millet (Kodo)",
            "Barley (Jau)",
            "Almonds and Walnuts",
          ],
          tip: null,
        },
        {
          name: "Cramp & Bloating Relief Foods",
          description: "Helps to reduce cramps, bloating and indigestion.",
          items: [
            "Papaya",
            "Yogurt",
            "Cucumber",
            "Pineapple",
            "Beetroot (Chukandar)",
            "Warm lemon water",
            "Coriander seed water (Dhaniya pani)",
            "Spinach / Green leafy vegetables",
          ],
          tip: null,
        },
      ],
      generalTips: [
        "Reduce excess salt and sugar.",
        "Limit caffeine and alcohol.",
        "Stay hydrated.",
        "Avoid cold foods and drinks.",
      ],
    },
    Exercise: [
      // ==================== YOGA POSES ====================
      { type: "header", text: "Yoga Poses" },

      {
        type: "exercise",
        category: "yoga",
        name: "1. Apanasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381250/apanasana_nvanhi.png",
        },
        steps: [
          "1. Lie on your back with legs straight.",
          "2. Slowly bend both knees and bring them close to your chest.",
          "3. Wrap your arms around your knees.",
          "4. Keep your head on the floor and breathe deeply.",
          "5. Stay in this pose for **2–3 minutes** with slow breathing",
        ],
        benefits: [
          "Relief to lower back and intestine",
          "Relieves gas and bloating",
        ],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "2. Ananda Balasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381248/ananda-balasana_voix3b.png",
        },
        steps: [
          "1. Lie on your back.",
          "2. Bend your knees and bring them towards your chest.",
          "3. Hold the outsides of your feet with your hands.",
          "4. Gently pull your knees down toward your armpits.",
          "5. Keep your back flat on the ground and breathe slowly.",
          "6. Stay in the pose for **2–3 minutes**.",
        ],
        benefits: [
          "Reduces cramps and tension and open hips",
          "Calms nervous system and improve mood",
        ],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "3. Parivrtta Janu Sirsasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381261/parivrtta-janu_fe8pce.png",
        },
        steps: [
          "1. Sit on the floor with one leg stretched out and the other leg bent inward.",
          "2. Turn your body slightly toward the stretched leg.",
          "3. Raise the same side arm and bend sideways toward the foot.",
          "4. Reach the foot or ankle gently (don't force).",
          "5. The other arm can rest on your bent knee or behind your back.",
          "6. Breathe and hold for **30 seconds**, then switch sides.",
          "7. **Repeat 2 times each side**.",
        ],
        benefits: [
          "Supports digestion and maintain liver",
          "Body stretches and calms mind",
        ],
        tips: ["Avoid forcing and don't do if you are too tired or crampy"],
      },
      {
        type: "exercise",
        category: "yoga",
        name: "4. Supta Matsyendrasana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381265/supta-matsyendrasana_i2uqmx.png",
        },
        steps: [
          "1. Lie on your back.",
          "2. Bend your right knee and bring it across your body to the left side.",
          "3. Keep your shoulders flat on the ground.",
          "4. Stretch your right arm to the side and look right.",
          "5. Relax and breathe deeply.",
          "6. Hold for **1–2 minutes**, then switch sides.",
          "7. **Repeat 2 times each side**.",
        ],
        benefits: [
          "Eases digestion and bloating",
          "Releases tension from spine and abdomen area",
        ],
      },

      // ============= MEDITATION & BREATHING =============
      { type: "header", text: "Meditation & Breathing" },

      {
        type: "exercise",
        category: "meditation",
        name: "1. Nadi Shodhana",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381246/anulom_vilom_c62pbc.jpg",
        },
        steps: [
          "1. Sit comfortably with your back straight.",
          "2. Use your **right thumb** to close your **right nostril**.",
          "3. Slowly **inhale through your left nostril**.",
          "4. Now, **close the left nostril** using your ring finger.",
          "5. **Exhale through the right nostril**.",
          "6. Then **inhale through the right nostril**,",
          "7. **Close the right**, and **exhale through the left nostril**.",
          "8. This is one round, Repeat this for **3–5 minutes** with calm breathing.",
        ],
        benefits: [
          "Calms anxiety, restlessness and provide emotional support",
          "Hormonal balance by calming nervous system",
        ],
      },
      {
        type: "exercise",
        category: "meditation",
        name: "2. Yoga Nidra",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381277/yoga-nidra_x81d7f.png",
        },
        steps: [
          "1. Lie flat on your back, arms and legs relaxed.",
          "2. Close your eyes and take a few deep breaths.",
          "3. Let your whole body feel heavy and calm.",
          "4. Imagine something peaceful – like clouds, ocean, or someone you love.",
          "5. Feel relaxed from head to toe.",
          "6. Stay in this restful state for **10–20 minutes**, especially before bed or after a tiring day.",
        ],
        benefits: [
          "Provide deep mental and physical rest",
          "Reduces premenstrual syndrome(PMS) including mood swings, depression, cravings and tender breasts.",
        ],
      },
      {
        type: "exercise",
        category: "meditation",
        name: "3. Bhramari",
        image: {
          uri: "https://res.cloudinary.com/drgny2hcw/image/upload/v1763381253/bhramari_jcrvns.png",
        },
        steps: [
          "1. Sit quietly with your eyes closed.",
          "2. Place your thumbs gently on your ears (to close them softly).",
          "3. Take a deep breath through your nose.",
          "4. While exhaling, make a soft humming sound like 'mmmmmm...'",
          "5. Feel the vibration in your head.",
          "6. Do this for **20–30 seconds**, and repeat **5–7 times**.",
        ],
        benefits: ["Calms nervous system", "Reduces stress and improves sleep"],
      },

      // ============== TIPS ==============
      { type: "header", text: "Tips" },
      {
        type: "text",
        content: "1.Don't go for high strength training",
      },
      {
        type: "text",
        content: "2.Go for normal walk for 20-30 minutes, try nature or parks",
      },
      {
        type: "text",
        content: "3.Can do dance also",
      },
      {
        type: "text",
        content: "4.Avoid competitive sports",
      },
    ],
    Focus: {
      categories: [
        {
          name: "Living",
          items: [
            "You may feel more emotional and sensitive, that's normal",
            "Don't force yourself to socialize",
            "Surround yourself with calming things: soft lighting, clean spaces, herbal teas etc.",
            "If you need time alone let the close ones know",
            "Choose peace over pleasure",
            "Try to take break from social media before an hour before bed time",
          ],
        },
        {
          name: "Working",
          items: [
            "Don't go for highly stressing works",
            "Not ideal time for public speaking or networking",
            "Avoid roles that demands intense energy like leadership roles",
            "Go for quiet space and creative works",
            "You can have good productivity but slow pace",
            "Take more breaks than usual, if you feel emotionally more reactive",
          ],
        },
      ],
      tips: ["Don't force yourself into high output"],
    },

    Love: {
      categories: [
        {
          name: "Relationships",
          items: [
            "You feel more easily hurt and emotional. Small issues might feel big, give yourself space",
            "Don't force yourself into conversations or social plans, its okay to say no",
            "Try to stay away from arguments, cause in this phase arguments can lead worse",
            "Its common to overthink in this phase, instead of overthinking do simple things like watch movie, spend time with someone calm",
          ],
        },
        {
          name: "Sex Status",
          items: [
            "You may not fell sexy cause your body wants comfort than pressure",
            "Focus on cuddling, massage or lying close together",
            "Go for slow and emotional intimacy, if you are in good mood",
            "Don't be afraid to say what you want clearly to your partner",
            "If you are single, give time to yourself",
          ],
        },
      ],
      tips: [
        "Avoid unnecessary conflicts",
        "Focus on self-love",
        "Prioritize yourself before anything",
      ],
    },
  },
};
