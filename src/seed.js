// ============================================
// GymPro — Demo Data Seeder
// Realistic data for 20+ members, trainers, plans, etc.
// ============================================

import {
  usersStore, membersStore, trainersStore, plansStore,
  subscriptionsStore, paymentsStore, attendanceStore,
  workoutsStore, nutritionStore, notificationsStore,
  markSeeded, generateId
} from './store.js';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function randomTime(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 14) + 6);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d.toISOString();
}

const today = new Date().toISOString();

export function seedData() {
  // ========== USERS (Admin & Reception) ==========
  usersStore.setAll([
    {
      id: 'user_admin',
      name: 'Ahmed Hassan',
      email: 'admin@gympro.com',
      password: 'admin123',
      role: 'admin',
      avatar: null,
      createdAt: daysAgo(365),
      updatedAt: today,
    },
    {
      id: 'user_reception',
      name: 'Sara Mohamed',
      email: 'reception@gympro.com',
      password: 'reception123',
      role: 'reception',
      avatar: null,
      createdAt: daysAgo(200),
      updatedAt: today,
    },
  ]);

  // ========== MEMBERSHIP PLANS ==========
  const plans = [
    {
      id: 'plan_monthly',
      name: 'Monthly',
      duration: 30,
      price: 500,
      features: ['Full gym access', 'Locker room', 'Free WiFi'],
      status: 'active',
      popular: false,
      createdAt: daysAgo(365),
      updatedAt: today,
    },
    {
      id: 'plan_quarterly',
      name: '3 Months',
      duration: 90,
      price: 1200,
      features: ['Full gym access', 'Locker room', 'Free WiFi', '1 PT session/month', '10% shop discount'],
      status: 'active',
      popular: true,
      createdAt: daysAgo(365),
      updatedAt: today,
    },
    {
      id: 'plan_semi',
      name: '6 Months',
      duration: 180,
      price: 2000,
      features: ['Full gym access', 'Locker room', 'Free WiFi', '2 PT sessions/month', '15% shop discount', 'Guest pass (2/month)'],
      status: 'active',
      popular: false,
      createdAt: daysAgo(365),
      updatedAt: today,
    },
    {
      id: 'plan_annual',
      name: 'Annual',
      duration: 365,
      price: 3500,
      features: ['Full gym access', 'Locker room', 'Free WiFi', '4 PT sessions/month', '20% shop discount', 'Guest pass (4/month)', 'Nutrition consultation', 'Priority booking'],
      status: 'active',
      popular: false,
      createdAt: daysAgo(365),
      updatedAt: today,
    },
  ];
  plansStore.setAll(plans);

  // ========== TRAINERS ==========
  const trainers = [
    {
      id: 'trainer_1',
      name: 'Omar Khaled',
      email: 'omar@gympro.com',
      phone: '+20 100 123 4567',
      specialization: 'Strength & Conditioning',
      experience: 8,
      salary: 8000,
      status: 'active',
      schedule: { sun: '8-14', mon: '8-14', tue: '8-14', wed: '8-14', thu: '8-14' },
      bio: 'Certified strength coach with 8 years of experience in bodybuilding and powerlifting.',
      membersAssigned: 12,
      rating: 4.8,
      createdAt: daysAgo(300),
      updatedAt: today,
    },
    {
      id: 'trainer_2',
      name: 'Nour Adel',
      email: 'nour@gympro.com',
      phone: '+20 101 234 5678',
      specialization: 'Yoga & Flexibility',
      experience: 5,
      salary: 6000,
      status: 'active',
      schedule: { sun: '14-20', mon: '14-20', tue: '14-20', thu: '14-20' },
      bio: 'Registered yoga instructor specializing in Vinyasa and Hatha yoga.',
      membersAssigned: 8,
      rating: 4.9,
      createdAt: daysAgo(250),
      updatedAt: today,
    },
    {
      id: 'trainer_3',
      name: 'Karim Mostafa',
      email: 'karim@gympro.com',
      phone: '+20 102 345 6789',
      specialization: 'CrossFit',
      experience: 6,
      salary: 7500,
      status: 'active',
      schedule: { sun: '6-12', mon: '6-12', wed: '6-12', thu: '6-12', fri: '8-14' },
      bio: 'CrossFit Level 2 certified trainer. Competed in regional CrossFit games.',
      membersAssigned: 15,
      rating: 4.7,
      createdAt: daysAgo(180),
      updatedAt: today,
    },
    {
      id: 'trainer_4',
      name: 'Hana Ali',
      email: 'hana@gympro.com',
      phone: '+20 103 456 7890',
      specialization: 'Cardio & HIIT',
      experience: 4,
      salary: 5500,
      status: 'active',
      schedule: { mon: '16-22', tue: '16-22', wed: '16-22', thu: '16-22' },
      bio: 'HIIT and cardio specialist focused on weight loss transformations.',
      membersAssigned: 10,
      rating: 4.6,
      createdAt: daysAgo(120),
      updatedAt: today,
    },
    {
      id: 'trainer_5',
      name: 'Youssef Tarek',
      email: 'youssef@gympro.com',
      phone: '+20 104 567 8901',
      specialization: 'Boxing & MMA',
      experience: 7,
      salary: 7000,
      status: 'inactive',
      schedule: {},
      bio: 'Former amateur boxer, now training clients in boxing fundamentals and MMA.',
      membersAssigned: 0,
      rating: 4.5,
      createdAt: daysAgo(90),
      updatedAt: today,
    },
  ];
  trainersStore.setAll(trainers);

  // ========== MEMBERS ==========
  const memberNames = [
    'Mohamed Ibrahim', 'Fatma Saeed', 'Ali Mahmoud', 'Mona Khalil',
    'Hassan Youssef', 'Dina Ashraf', 'Khaled Nasser', 'Rania Farouk',
    'Amr Gamal', 'Yasmin Tamer', 'Mahmoud Reda', 'Layla Sherif',
    'Tarek Hussein', 'Nada Emad', 'Waleed Sami', 'Salma Hazem',
    'Adel Ramadan', 'Heba Fathy', 'Mostafa Wael', 'Aya Magdy',
    'Ziad Hossam', 'Rana Sherif', 'Kareem Bassem', 'Noha Ayman',
  ];

  const phones = [
    '+20 100 111 2222', '+20 101 222 3333', '+20 102 333 4444', '+20 103 444 5555',
    '+20 100 555 6666', '+20 101 666 7777', '+20 102 777 8888', '+20 103 888 9999',
    '+20 100 999 0000', '+20 101 000 1111', '+20 102 111 3333', '+20 103 222 4444',
    '+20 100 333 5555', '+20 101 444 6666', '+20 102 555 7777', '+20 103 666 8888',
    '+20 100 777 9999', '+20 101 888 0000', '+20 102 999 1111', '+20 103 000 2222',
    '+20 100 123 7777', '+20 101 234 8888', '+20 102 345 9999', '+20 103 456 0000',
  ];

  const genders = ['male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female'];

  const members = memberNames.map((name, i) => {
    const planIndex = i % 4;
    const plan = plans[planIndex];
    const joinedDaysAgo = Math.floor(Math.random() * 300) + 10;
    const isExpired = i >= 20; // Last 4 are expired
    const subStart = daysAgo(joinedDaysAgo);
    const subEnd = isExpired ? daysAgo(Math.floor(Math.random() * 10) + 1) : daysFromNow(Math.floor(Math.random() * plan.duration));

    return {
      id: `member_${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/ /g, '.')}@email.com`,
      phone: phones[i],
      gender: genders[i],
      dateOfBirth: `${1985 + (i % 15)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      address: 'Cairo, Egypt',
      emergencyContact: `+20 10${i} 999 9999`,
      status: isExpired ? 'expired' : 'active',
      planId: plan.id,
      planName: plan.name,
      subscriptionStart: subStart,
      subscriptionEnd: subEnd,
      trainerId: trainers[i % 4].id,
      trainerName: trainers[i % 4].name,
      qrCode: `QR-${1000 + i}`,
      notes: '',
      weight: 65 + Math.floor(Math.random() * 35),
      height: 160 + Math.floor(Math.random() * 30),
      goal: ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Flexibility'][i % 4],
      createdAt: daysAgo(joinedDaysAgo),
      updatedAt: today,
    };
  });
  membersStore.setAll(members);

  // ========== SUBSCRIPTIONS ==========
  const subscriptions = members.map((m, i) => ({
    id: `sub_${i + 1}`,
    memberId: m.id,
    memberName: m.name,
    planId: m.planId,
    planName: m.planName,
    startDate: m.subscriptionStart,
    endDate: m.subscriptionEnd,
    status: m.status,
    amount: plans.find(p => p.id === m.planId)?.price || 500,
    createdAt: m.subscriptionStart,
    updatedAt: today,
  }));
  subscriptionsStore.setAll(subscriptions);

  // ========== PAYMENTS ==========
  const paymentMethods = ['cash', 'card', 'bank_transfer'];
  const payments = members.map((m, i) => ({
    id: `pay_${i + 1}`,
    memberId: m.id,
    memberName: m.name,
    subscriptionId: `sub_${i + 1}`,
    amount: plans.find(p => p.id === m.planId)?.price || 500,
    method: paymentMethods[i % 3],
    status: i >= 22 ? 'pending' : 'paid',
    invoiceNumber: `INV-${2026}${String(i + 1).padStart(4, '0')}`,
    notes: '',
    createdAt: m.subscriptionStart,
    updatedAt: today,
  }));

  // Add some extra renewal payments
  for (let i = 0; i < 8; i++) {
    payments.push({
      id: `pay_renewal_${i + 1}`,
      memberId: members[i].id,
      memberName: members[i].name,
      subscriptionId: `sub_${i + 1}`,
      amount: plans.find(p => p.id === members[i].planId)?.price || 500,
      method: paymentMethods[i % 3],
      status: 'paid',
      invoiceNumber: `INV-${2026}${String(30 + i).padStart(4, '0')}`,
      notes: 'Renewal payment',
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
      updatedAt: today,
    });
  }
  paymentsStore.setAll(payments);

  // ========== ATTENDANCE ==========
  const attendanceRecords = [];
  // Generate attendance for the last 30 days
  for (let day = 0; day < 30; day++) {
    const attendeesCount = Math.floor(Math.random() * 15) + 10; // 10-25 per day
    const shuffled = [...members].filter(m => m.status === 'active').sort(() => 0.5 - Math.random());
    const dayAttendees = shuffled.slice(0, attendeesCount);

    dayAttendees.forEach(member => {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() - day);
      checkInDate.setHours(Math.floor(Math.random() * 14) + 6);
      checkInDate.setMinutes(Math.floor(Math.random() * 60));

      attendanceRecords.push({
        id: generateId(),
        memberId: member.id,
        memberName: member.name,
        checkIn: checkInDate.toISOString(),
        checkOut: null,
        method: Math.random() > 0.3 ? 'qr' : 'manual',
        createdAt: checkInDate.toISOString(),
        updatedAt: checkInDate.toISOString(),
      });
    });
  }
  attendanceStore.setAll(attendanceRecords);

  // ========== WORKOUT PLANS ==========
  workoutsStore.setAll([
    {
      id: 'workout_1',
      name: 'Beginner Full Body',
      description: 'A balanced full-body routine for newcomers. 3 days per week.',
      level: 'beginner',
      duration: '45 min',
      daysPerWeek: 3,
      exercises: [
        { name: 'Squats', sets: 3, reps: 12, rest: '60s' },
        { name: 'Push-ups', sets: 3, reps: 10, rest: '60s' },
        { name: 'Dumbbell Rows', sets: 3, reps: 12, rest: '60s' },
        { name: 'Plank', sets: 3, reps: '30s', rest: '30s' },
        { name: 'Lunges', sets: 3, reps: 10, rest: '60s' },
      ],
      assignedTo: ['member_1', 'member_5', 'member_9'],
      createdBy: 'trainer_1',
      createdAt: daysAgo(60),
      updatedAt: today,
    },
    {
      id: 'workout_2',
      name: 'Muscle Building — Push/Pull/Legs',
      description: 'Classic PPL split for intermediate lifters. 6 days per week.',
      level: 'intermediate',
      duration: '60 min',
      daysPerWeek: 6,
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 8, rest: '90s' },
        { name: 'Overhead Press', sets: 3, reps: 10, rest: '90s' },
        { name: 'Deadlifts', sets: 4, reps: 6, rest: '120s' },
        { name: 'Barbell Rows', sets: 4, reps: 8, rest: '90s' },
        { name: 'Squats', sets: 4, reps: 8, rest: '120s' },
        { name: 'Leg Press', sets: 3, reps: 12, rest: '90s' },
      ],
      assignedTo: ['member_2', 'member_6', 'member_10'],
      createdBy: 'trainer_1',
      createdAt: daysAgo(45),
      updatedAt: today,
    },
    {
      id: 'workout_3',
      name: 'HIIT Fat Burner',
      description: 'High-intensity interval training for maximum fat loss.',
      level: 'advanced',
      duration: '30 min',
      daysPerWeek: 4,
      exercises: [
        { name: 'Burpees', sets: 4, reps: 15, rest: '30s' },
        { name: 'Mountain Climbers', sets: 4, reps: 20, rest: '30s' },
        { name: 'Jump Squats', sets: 4, reps: 15, rest: '30s' },
        { name: 'Box Jumps', sets: 3, reps: 12, rest: '45s' },
        { name: 'Battle Ropes', sets: 3, reps: '30s', rest: '30s' },
      ],
      assignedTo: ['member_3', 'member_7'],
      createdBy: 'trainer_3',
      createdAt: daysAgo(30),
      updatedAt: today,
    },
    {
      id: 'workout_4',
      name: 'Yoga Flow',
      description: 'Relaxing yoga sequence for flexibility and stress relief.',
      level: 'beginner',
      duration: '60 min',
      daysPerWeek: 3,
      exercises: [
        { name: 'Sun Salutation', sets: 3, reps: 5, rest: '15s' },
        { name: 'Warrior Poses', sets: 2, reps: '45s hold', rest: '15s' },
        { name: 'Tree Pose', sets: 2, reps: '30s hold', rest: '15s' },
        { name: 'Downward Dog', sets: 3, reps: '30s hold', rest: '15s' },
        { name: 'Savasana', sets: 1, reps: '5 min', rest: '0s' },
      ],
      assignedTo: ['member_4', 'member_8'],
      createdBy: 'trainer_2',
      createdAt: daysAgo(20),
      updatedAt: today,
    },
  ]);

  // ========== NUTRITION PLANS ==========
  nutritionStore.setAll([
    {
      id: 'nutrition_1',
      name: 'Weight Loss Plan',
      description: 'Calorie-deficit diet with balanced macros for sustainable weight loss.',
      targetCalories: 1800,
      meals: [
        { name: 'Breakfast', items: ['Oatmeal with berries', 'Green tea'], calories: 350 },
        { name: 'Snack', items: ['Greek yogurt', 'Almonds (10)'], calories: 200 },
        { name: 'Lunch', items: ['Grilled chicken breast', 'Brown rice', 'Mixed salad'], calories: 550 },
        { name: 'Snack', items: ['Protein shake', 'Apple'], calories: 250 },
        { name: 'Dinner', items: ['Salmon fillet', 'Steamed vegetables', 'Sweet potato'], calories: 450 },
      ],
      macros: { protein: 140, carbs: 180, fat: 55 },
      assignedTo: ['member_1', 'member_9'],
      createdBy: 'trainer_4',
      createdAt: daysAgo(40),
      updatedAt: today,
    },
    {
      id: 'nutrition_2',
      name: 'Muscle Gain Plan',
      description: 'High-protein, calorie-surplus diet for muscle building.',
      targetCalories: 3000,
      meals: [
        { name: 'Breakfast', items: ['Eggs (4)', 'Whole wheat toast (2)', 'Banana'], calories: 600 },
        { name: 'Snack', items: ['Protein bar', 'Peanut butter shake'], calories: 450 },
        { name: 'Lunch', items: ['Beef steak', 'Pasta', 'Avocado salad'], calories: 800 },
        { name: 'Post-workout', items: ['Whey protein', 'Banana', 'Rice cakes'], calories: 400 },
        { name: 'Dinner', items: ['Chicken thighs', 'Quinoa', 'Broccoli'], calories: 750 },
      ],
      macros: { protein: 200, carbs: 320, fat: 85 },
      assignedTo: ['member_2', 'member_6'],
      createdBy: 'trainer_1',
      createdAt: daysAgo(35),
      updatedAt: today,
    },
    {
      id: 'nutrition_3',
      name: 'Balanced Maintenance',
      description: 'Balanced diet for maintaining current weight and overall health.',
      targetCalories: 2200,
      meals: [
        { name: 'Breakfast', items: ['Scrambled eggs (2)', 'Whole grain bread', 'Orange juice'], calories: 400 },
        { name: 'Snack', items: ['Mixed nuts', 'Dried fruit'], calories: 250 },
        { name: 'Lunch', items: ['Grilled fish', 'Brown rice', 'Vegetables'], calories: 600 },
        { name: 'Snack', items: ['Cottage cheese', 'Berries'], calories: 200 },
        { name: 'Dinner', items: ['Lean meat', 'Roasted vegetables', 'Hummus'], calories: 550 },
      ],
      macros: { protein: 120, carbs: 250, fat: 70 },
      assignedTo: ['member_3', 'member_4'],
      createdBy: 'trainer_2',
      createdAt: daysAgo(25),
      updatedAt: today,
    },
  ]);

  // ========== NOTIFICATIONS ==========
  notificationsStore.setAll([
    {
      id: 'notif_1',
      type: 'warning',
      title: 'Memberships Expiring',
      message: '4 memberships are expiring within the next 7 days.',
      read: false,
      link: '#/members',
      createdAt: daysAgo(0),
    },
    {
      id: 'notif_2',
      type: 'success',
      title: 'New Member Registered',
      message: 'Aya Magdy just signed up for the 3 Months plan.',
      read: false,
      link: '#/members',
      createdAt: daysAgo(1),
    },
    {
      id: 'notif_3',
      type: 'info',
      title: 'Payment Received',
      message: 'Payment of EGP 1,200 received from Mohamed Ibrahim.',
      read: true,
      link: '#/payments',
      createdAt: daysAgo(2),
    },
    {
      id: 'notif_4',
      type: 'warning',
      title: 'Pending Payment',
      message: '2 payments are still pending confirmation.',
      read: true,
      link: '#/payments',
      createdAt: daysAgo(3),
    },
    {
      id: 'notif_5',
      type: 'info',
      title: 'Monthly Report Ready',
      message: 'June 2026 revenue and attendance report is now available.',
      read: true,
      link: '#/reports',
      createdAt: daysAgo(5),
    },
  ]);

  markSeeded();
  console.log('✅ GymPro: Demo data seeded successfully');
}
