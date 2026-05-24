import React, { useState, useEffect } from "react";
import { Gender, ActivityLevel, AthleteType, HistoryEntry, CalculationResult } from "../types";
import { 
  Dumbbell, 
  Calculator, 
  History, 
  User as UserIcon,
  Save, 
  Trash2, 
  TrendingUp, 
  Info, 
  CheckCircle,
  AlertTriangle,
  Scale,
  Flame,
  PieChart,
  TrendingDown,
  RefreshCw,
  FolderDown,
  Sparkles,
  Award,
  Clock,
  ChevronRight
} from "lucide-react";

export function MainDashboard() {
  // Navigation Tabs: 'calculator' | 'history' | 'insights'
  const [activeTab, setActiveTab] = useState<'calculator' | 'history' | 'insights'>('calculator');

  // Interactive Form Inputs (with responsive defaults and immediate load)
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [age, setAge] = useState<number | string>(25);
  const [height, setHeight] = useState<number | string>(175);
  const [weight, setWeight] = useState<number | string>(72);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(ActivityLevel.MODERATE);
  const [athleteType, setAthleteType] = useState<AthleteType>(AthleteType.GENERAL);

  // States
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  const [selectedMacroPlan, setSelectedMacroPlan] = useState<'maintenance' | 'fatLoss' | 'muscleGain'>('maintenance');

  // Load baseline values & history from LocalStorage on mount
  useEffect(() => {
    // 1. Bio profile defaults loading
    const savedGender = localStorage.getItem("fitmatrix_gender") as Gender;
    const savedAge = localStorage.getItem("fitmatrix_age");
    const savedHeight = localStorage.getItem("fitmatrix_height");
    const savedWeight = localStorage.getItem("fitmatrix_weight");
    const savedActivity = localStorage.getItem("fitmatrix_activity") as ActivityLevel;
    const savedAthlete = localStorage.getItem("fitmatrix_athlete") as AthleteType;

    if (savedGender) setGender(savedGender);
    if (savedAge) setAge(parseInt(savedAge, 10));
    if (savedHeight) setHeight(parseFloat(savedHeight));
    if (savedWeight) setWeight(parseFloat(savedWeight));
    if (savedActivity) setActivityLevel(savedActivity);
    if (savedAthlete) setAthleteType(savedAthlete);

    // 2. Load History items
    const savedHistoryStr = localStorage.getItem("fitmatrix_history_logs");
    if (savedHistoryStr) {
      try {
        const parsed = JSON.parse(savedHistoryStr);
        const instantiated = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        setHistoryList(instantiated);
      } catch (e) {
        console.error("Failed to parse local stored history, starting fresh.", e);
        setHistoryList([]);
      }
    } else {
      // Seed some initial demo history metrics for the graph to look gorgeous immediately!
      const demoHistory: HistoryEntry[] = [
        {
          id: "demo_1",
          weight: 76.5,
          height: 175,
          age: 25,
          gender: Gender.MALE,
          activityLevel: ActivityLevel.MODERATE,
          athleteType: AthleteType.GENERAL,
          bmi: 25.0,
          tdee: 2550,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        },
        {
          id: "demo_2",
          weight: 75.0,
          height: 175,
          age: 25,
          gender: Gender.MALE,
          activityLevel: ActivityLevel.MODERATE,
          athleteType: AthleteType.GENERAL,
          bmi: 24.5,
          tdee: 2520,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
        },
        {
          id: "demo_3",
          weight: 73.8,
          height: 175,
          age: 25,
          gender: Gender.MALE,
          activityLevel: ActivityLevel.MODERATE,
          athleteType: AthleteType.GENERAL,
          bmi: 24.1,
          tdee: 2500,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        },
        {
          id: "demo_4",
          weight: 72.0,
          height: 175,
          age: 25,
          gender: Gender.MALE,
          activityLevel: ActivityLevel.MODERATE,
          athleteType: AthleteType.GENERAL,
          bmi: 23.5,
          tdee: 2480,
          createdAt: new Date()
        }
      ];
      setHistoryList(demoHistory);
      localStorage.setItem("fitmatrix_history_logs", JSON.stringify(demoHistory));
    }
  }, []);

  // Recalculate everything reactively on parameter changes
  useEffect(() => {
    triggerCalculation(gender, age, height, weight, activityLevel, athleteType);
  }, [gender, age, height, weight, activityLevel, athleteType]);

  // BMI and Mifflin-St Jeor TDEE Algorithms
  const triggerCalculation = (
    g: Gender,
    a: number | string,
    h: number | string,
    w: number | string,
    act: ActivityLevel,
    ath: AthleteType
  ) => {
    // Elegant fallback parsing during user typing states
    const parsedW = typeof w === "string" ? parseFloat(w) : w;
    const parsedH = typeof h === "string" ? parseFloat(h) : h;
    const parsedA = typeof a === "string" ? parseInt(a, 10) : a;

    if (!parsedW || !parsedH || !parsedA || isNaN(parsedW) || isNaN(parsedH) || isNaN(parsedA)) {
      setCalculation(null);
      return;
    }

    const wNum = parsedW;
    const hNum = parsedH;
    const aNum = parsedA;

    // 1. BMI Calculation (weight / height in meters squared)
    const heightMeters = hNum / 100;
    const bmiVal = wNum / (heightMeters * heightMeters);
    const bmiFloat = parseFloat(bmiVal.toFixed(1));

    // Determing badge details
    let bmiStatus = "Normal";
    let bmiColor = "bg-[#2a9d8f] text-white";
    if (bmiFloat < 18.5) {
      bmiStatus = "Underweight";
      bmiColor = "bg-amber-500 text-white";
    } else if (bmiFloat >= 18.5 && bmiFloat <= 24.9) {
      bmiStatus = "Normal";
      bmiColor = "bg-[#2a9d8f] text-white";
    } else if (bmiFloat >= 25.0 && bmiFloat <= 29.9) {
      bmiStatus = "Overweight";
      bmiColor = "bg-orange-500 text-white";
    } else {
      bmiStatus = "Obese";
      bmiColor = "bg-red-500 text-white";
    }

    // 2. TDEE Mifflin-St Jeor Formula
    let bmr = 0;
    if (g === Gender.MALE) {
      bmr = 10 * wNum + 6.25 * hNum - 5 * aNum + 5;
    } else {
      bmr = 10 * wNum + 6.25 * hNum - 5 * aNum - 161;
    }

    // Activity multiplier offsets
    let activityMultiplier = 1.2;
    if (act === ActivityLevel.SEDENTARY) activityMultiplier = 1.2;
    else if (act === ActivityLevel.LIGHT) activityMultiplier = 1.375;
    else if (act === ActivityLevel.MODERATE) activityMultiplier = 1.55;
    else if (act === ActivityLevel.ACTIVE) activityMultiplier = 1.725;
    else if (act === ActivityLevel.VERY_ACTIVE) activityMultiplier = 1.9;

    let computedTdee = bmr * activityMultiplier;

    // Musculoskeletal structure & Density overrides
    if (ath === AthleteType.ENTHUSIAST) {
      computedTdee += 105; // Extra energy consumption offset for muscle preservation
    } else if (ath === AthleteType.ATHLETE) {
      computedTdee += 260; // Hyperdense lean tissue metabolism offset
    }

    const tdeeFinal = Math.round(computedTdee);

    // Caloric Recommendations
    const fatLoss = tdeeFinal - 500;
    const maintenance = tdeeFinal;
    const muscleGain = tdeeFinal + 320;

    // Athlete Overweight adjustment alert rule:
    const showAthleteNotice = ath === AthleteType.ATHLETE && bmiFloat >= 25.0;

    setCalculation({
      bmi: bmiFloat,
      bmiStatus,
      bmiColor,
      tdee: tdeeFinal,
      fatLoss,
      maintenance,
      muscleGain,
      showAthleteNotice
    });
  };

  // Triggers when user updates the bio-form and hits "Save Calibration"
  const handleSaveProfileSettings = () => {
    // Save settings statically to localStorage
    localStorage.setItem("fitmatrix_gender", gender);
    localStorage.setItem("fitmatrix_age", age.toString());
    localStorage.setItem("fitmatrix_height", height.toString());
    localStorage.setItem("fitmatrix_weight", weight.toString());
    localStorage.setItem("fitmatrix_activity", activityLevel);
    localStorage.setItem("fitmatrix_athlete", athleteType);

    setSuccessMessage("Your physical configurations have been saved locally!");
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Appends active scoring to the Weight History Log
  const handleSaveToHistory = () => {
    if (!calculation) return;

    const entryId = `entry_${Date.now()}`;
    const newEntry: HistoryEntry = {
      id: entryId,
      weight: parseFloat(weight.toString()),
      height: parseFloat(height.toString()),
      age: parseInt(age.toString(), 10),
      gender,
      activityLevel,
      athleteType,
      bmi: calculation.bmi,
      tdee: calculation.tdee,
      createdAt: new Date()
    };

    const updatedHistory = [newEntry, ...historyList];
    setHistoryList(updatedHistory);
    localStorage.setItem("fitmatrix_history_logs", JSON.stringify(updatedHistory));

    setSuccessMessage("Current measurements logged successfully in your tracker!");
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Erase history items
  const handleDeleteHistoryEntry = (entryId: string) => {
    const updatedHistory = historyList.filter(item => item.id !== entryId);
    setHistoryList(updatedHistory);
    localStorage.setItem("fitmatrix_history_logs", JSON.stringify(updatedHistory));

    setSuccessMessage("Ledger log entry cleared.");
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Resets profile to default baseline values
  const handleResetToBaseline = () => {
    setGender(Gender.MALE);
    setAge(25);
    setHeight(175);
    setWeight(72);
    setActivityLevel(ActivityLevel.MODERATE);
    setAthleteType(AthleteType.GENERAL);

    setSuccessMessage("Calibration fields reset back to standards.");
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Clear all tracking logs
  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to completely erase your weight history log? This cannot be undone.")) {
      setHistoryList([]);
      localStorage.removeItem("fitmatrix_history_logs");
      setSuccessMessage("Biometric logs erased successfully.");
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  // Calculate customized Macro split grams based on targeted plan selection
  // Assumption: Protein: 2.0g per kg of body weight (4 kcal per gram)
  // Fat: 22% of total daily energy (9 kcal per gram)
  // Carbohydrate: Remainder of energy (4 kcal per gram)
  const getMacrosForSelectedPlan = () => {
    if (!calculation) return { protein: 0, fat: 0, carbs: 0, totalKcal: 0 };

    let totalKcal = calculation.maintenance;
    if (selectedMacroPlan === 'fatLoss') totalKcal = calculation.fatLoss;
    if (selectedMacroPlan === 'muscleGain') totalKcal = calculation.muscleGain;

    // Calculate Protein (2g per kg bodyweight)
    const weightNum = typeof weight === "string" ? parseFloat(weight) : weight;
    let proteinGrams = Math.round((weightNum || 70) * 2);
    let proteinKcal = proteinGrams * 4;

    // Safeguard for very low or high bodyweights
    if (proteinGrams < 50) {
      proteinGrams = 50;
      proteinKcal = 200;
    }

    // Calculate Fat (22% of total physical budget)
    const fatKcal = totalKcal * 0.22;
    const fatGrams = Math.round(fatKcal / 9);

    // Carbohydrates: Remainder
    const remainderKcal = totalKcal - (proteinKcal + fatKcal);
    const carbsGrams = Math.max(0, Math.round(remainderKcal / 4));

    return {
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams,
      totalKcal
    };
  };

  const macros = getMacrosForSelectedPlan();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col" id="dashboard_root">
      {/* Editorial Responsive Navigation Header - Ultra-clean Layout */}
      <nav className="bg-slate-navy text-white px-6 py-4.5 shadow-xl border-b border-navy-light/20 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10" id="navbar">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-teal text-white rounded-xl shadow-md border border-primary-teal/20">
            <Dumbbell className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              FITMATRIX <span className="text-primary-teal font-mono text-xs px-1.5 py-0.5 rounded bg-primary-teal/15">PRO</span>
            </h1>
            <span className="text-[10px] text-teal-300 font-mono tracking-wider uppercase block">Biometric Expenditure Calibration</span>
          </div>
        </div>

        {/* Tab Selector Links */}
        <div className="flex bg-navy-dark p-1 rounded-xl border border-navy-light/10" id="tabs">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all flex items-center gap-2 ${activeTab === 'calculator' ? 'bg-primary-teal text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <Calculator className="w-4 h-4" />
            <span>Matrix Calculator</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-primary-teal text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <History className="w-4 h-4" />
            <span>Weight Progress Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all flex items-center gap-2 ${activeTab === 'insights' ? 'bg-primary-teal text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <PieChart className="w-4 h-4" />
            <span>Nutritional Insights</span>
          </button>
        </div>

        {/* Right Status Badge */}
        <div className="hidden md:flex items-center gap-3 border-l border-white/10 pl-4 h-8" id="profile_actions">
          <div className="text-right">
            <span className="font-semibold text-xs text-white block">Offline Sandbox Profile</span>
            <span className="text-[9px] text-teal-300 font-mono tracking-wider block">LOCALSTORAGE ACTIVE</span>
          </div>
        </div>
      </nav>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6" id="workspace">
        
        {/* Dynamic Context Toast Notification Alerts */}
        {successMessage && (
          <div className="p-4 bg-soft-teal border-l-4 border-primary-teal rounded-r-xl shadow-lg flex items-center justify-between gap-3 text-slate-navy animate-fade-in" id="toast_success">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-primary-teal shrink-0" />
              <span className="text-xs font-semibold text-slate-navy">{successMessage}</span>
            </div>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="text-[10px] text-teal-700 hover:underline font-bold uppercase"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. INTERACTIVE CALCULATOR TAB */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="calculator_tab">
            
            {/* Left Biometrics Capture Panel */}
            <div className="lg:col-span-5 bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 sm:p-8 space-y-6" id="input_module">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-navy font-sans mb-1 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary-teal" /> Personal Physical Formulator
                  </h3>
                  <p className="text-slate-500 text-xs text-left">
                    Adjust measurements to instantly process dynamic Body Mass Indexes and calculated daily metabolisms.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetToBaseline}
                  title="Reset fields"
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                >
                  <RefreshCw className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-6" id="calculator_inputs">
                {/* Gender Selector */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Biological Gender
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: Gender.MALE, label: "Male" },
                      { val: Gender.FEMALE, label: "Female" }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setGender(item.val)}
                        className={`py-3 px-4 rounded-xl border text-sm font-semibold cursor-pointer transition-all text-center ${gender === item.val ? 'border-primary-teal bg-primary-teal/5 text-primary-teal font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliding controls for Heights and Weights */}
                <div className="space-y-5">
                  {/* Height Slider Controller */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold uppercase tracking-wider text-slate-500">Body Height</span>
                      <span className="font-mono font-bold text-slate-navy bg-slate-100 px-2 py-0.5 rounded">
                        {height} cm
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="120"
                      max="230"
                      step="1"
                      value={parseFloat(height?.toString()) || 175}
                      onChange={(e) => setHeight(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-teal"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>120 cm</span>
                      <span>Average (175 cm)</span>
                      <span>230 cm</span>
                    </div>
                  </div>

                  {/* Weight Slider Controller */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold uppercase tracking-wider text-slate-500">Body Weight</span>
                      <span className="font-mono font-bold text-slate-navy bg-slate-100 px-2 py-0.5 rounded">
                        {weight} kg
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="160"
                      step="0.5"
                      value={parseFloat(weight?.toString()) || 70}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-teal"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>40 kg</span>
                      <span>Standard (70 kg)</span>
                      <span>160 kg</span>
                    </div>
                  </div>

                  {/* Manual Input adjustment parameters (For Age + Custom Precision overriding) */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Age (Years)
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        onBlur={() => {
                          const parsed = parseInt(age.toString(), 10) || 25;
                          setAge(Math.min(120, Math.max(1, parsed)));
                        }}
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-2 text-center text-xs font-mono font-bold text-slate-navy focus:bg-white focus:ring-1 focus:ring-primary-teal outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Height (Precise)
                      </label>
                      <input 
                        type="number"
                        min="40"
                        max="300"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        onBlur={() => {
                          const parsed = parseFloat(height.toString()) || 175;
                          setHeight(Math.min(300, Math.max(40, parsed)));
                        }}
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-2 text-center text-xs font-mono font-bold text-slate-navy focus:bg-white focus:ring-1 focus:ring-primary-teal outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Weight (Precise)
                      </label>
                      <input 
                        type="number"
                        min="10"
                        max="500"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        onBlur={() => {
                          const parsed = parseFloat(weight.toString()) || 72;
                          setWeight(Math.min(500, Math.max(10, parsed)));
                        }}
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-2 text-center text-xs font-mono font-bold text-slate-navy focus:bg-white focus:ring-1 focus:ring-primary-teal outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Daily Activity Level Dropdown selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 text-left">
                    Daily Activity Multiplier Factor
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-navy focus:bg-white focus:ring-1 focus:ring-primary-teal outline-none cursor-pointer"
                  >
                    <option value={ActivityLevel.SEDENTARY}>Sedentary — Office Job / Little to no exercise</option>
                    <option value={ActivityLevel.LIGHT}>Lightly Active — Casual walks / Exercise 1-3 days/week</option>
                    <option value={ActivityLevel.MODERATE}>Moderately Active — Medium load / Gym training 3-5 days/week</option>
                    <option value={ActivityLevel.ACTIVE}>Very Active — Intense physical work / Gym workout 6-7 days/week</option>
                    <option value={ActivityLevel.VERY_ACTIVE}>Extra Active — Professional Athlete / Two workouts daily</option>
                  </select>
                </div>

                {/* Athlete Muscle Structure Compensator */}
                <div className="bg-soft-teal p-4 border border-primary-teal/10 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-teal">
                    <Award className="w-4 h-4 text-primary-teal shrink-0" />
                    <span>Muscular Athlete Compensator</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal text-left">
                    Muscle is far denser than adipose fat. Bodybuilders or intense fitness enthusiasts register heavy mass which standard index systems false-flag as obese. High athletic adjustments recalculate your core expenditures to offset muscle maintenance.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2" id="athlete_selector">
                    {[
                      { type: AthleteType.GENERAL, label: "General" },
                      { type: AthleteType.ENTHUSIAST, label: "Enthusiast" },
                      { type: AthleteType.ATHLETE, label: "Elite Athlete" }
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setAthleteType(item.type)}
                        className={`py-2 px-1 text-[11px] font-bold tracking-tight rounded-lg border cursor-pointer transition-all ${athleteType === item.type ? 'bg-primary-teal text-white border-primary-teal shadow' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save defaults to LocalStorage button */}
                <button
                  type="button"
                  onClick={handleSaveProfileSettings}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>Save configurations as default</span>
                </button>
              </div>
            </div>

            {/* Right Matrix Analysis Results View */}
            <div className="lg:col-span-7 bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6" id="results_module">
              {calculation ? (
                <div className="space-y-6 flex-1 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-navy font-sans mb-1 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-coral-accent" /> FitMatrix Biometric Report
                      </h3>
                      <p className="text-slate-500 text-xs">
                        Computed instantly using the established Mifflin-St Jeor formula + custom musculoskeletal ratios.
                      </p>
                    </div>
                    {/* Absolute Sync Logs */}
                    <button
                      onClick={handleSaveToHistory}
                      className="px-3 py-1.5 bg-slate-navy hover:bg-navy-dark text-white rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow"
                    >
                      <Save className="w-3.5 h-3.5 text-primary-teal" />
                      <span>Log current entry</span>
                    </button>
                  </div>

                  {/* Core KPI metrics deck */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* BMI scoreboard */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-200/50 to-transparent rounded-bl-3xl pointer-events-none" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Body Mass Index (BMI)</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-slate-navy font-mono tracking-tight">{calculation.bmi}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase leading-none ${calculation.bmiColor}`}>
                            {calculation.bmiStatus}
                          </span>
                        </div>
                      </div>
                      
                      {/* Sub-gauge for quick visualization */}
                      <div className="mt-4 pt-4 border-t border-slate-200/60">
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-primary-teal rounded-full"
                            style={{ width: `${Math.min(100, Math.max(10, (calculation.bmi / 40) * 100))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                          <span>18.5 Under</span>
                          <span>24.9 Healthy</span>
                          <span>30.0+ Obese</span>
                        </div>
                      </div>
                    </div>

                    {/* TDEE scoreboard */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary-teal/10 to-transparent rounded-bl-3xl pointer-events-none" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Total Daily Energy (TDEE)</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-primary-teal font-mono tracking-tight">{calculation.tdee}</span>
                          <span className="text-xs font-bold text-slate-500 font-mono">kcal / day</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-[11px] text-slate-500 font-sans leading-relaxed tracking-tight flex items-start gap-1.5 pt-3 border-t border-slate-200/60">
                        <Flame className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
                        <span>Calculated energy budget required to sustain your current muscle density structure.</span>
                      </div>
                    </div>
                  </div>

                  {/* Muscle density Overweight/Obese notice */}
                  {calculation.showAthleteNotice && (
                    <div className="bg-soft-orange border border-coral-accent/15 p-4 rounded-xl flex gap-3 animate-fade-in" id="athlete_notice_box">
                      <AlertTriangle className="w-5 h-5 text-coral-accent shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-slate-navy">Muscular Athlete Density Factor Notice</span>
                        <p className="text-[11px] text-slate-600 leading-normal">
                          Your current calculated BMI is <strong>{calculation.bmi}</strong> ({calculation.bmiStatus}) while utilizing the <strong>Elite Athlete</strong> modifier. Under normal circumstances, general calculators register individuals with high lean ratios as overweight, because standard tables ignore muscle vs. fat distribution. Since you are dynamic and lean, your body adiposity is structurally safe.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Three targets plans cards */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                      <PieChart className="w-4 h-4 text-primary-teal" /> Goal-Based Energy Targets
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Fat loss -500 calories */}
                      <button
                        type="button"
                        onClick={() => setSelectedMacroPlan('fatLoss')}
                        className={`p-4 rounded-xl border text-left relative overflow-hidden transition-all ${selectedMacroPlan === 'fatLoss' ? 'border-coral-accent bg-[#fff9f6] ring-2 ring-coral-accent/25 ring-offset-1' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                      >
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-coral-accent/10 text-coral-accent">
                          <TrendingDown className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-coral-accent block">Fat Loss</span>
                          <span className="text-xs text-slate-500 block">Deficit (-500)</span>
                        </div>
                        <div className="mt-4">
                          <span className="text-2xl font-black text-slate-navy font-mono">{calculation.fatLoss}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">kcal / day</span>
                        </div>
                      </button>

                      {/* Weight Maintenance - Balance */}
                      <button
                        type="button"
                        onClick={() => setSelectedMacroPlan('maintenance')}
                        className={`p-4 rounded-xl border text-left relative overflow-hidden transition-all ${selectedMacroPlan === 'maintenance' ? 'border-primary-teal bg-[#f1fbf8] ring-2 ring-primary-teal/25 ring-offset-1' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                      >
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-primary-teal/10 text-primary-teal">
                          <Scale className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-teal block">Maintenance</span>
                          <span className="text-xs text-slate-500 block">Energy Balance</span>
                        </div>
                        <div className="mt-4">
                          <span className="text-2xl font-black text-slate-navy font-mono">{calculation.maintenance}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">kcal / day</span>
                        </div>
                      </button>

                      {/* Muscle Gain - Surplus */}
                      <button
                        type="button"
                        onClick={() => setSelectedMacroPlan('muscleGain')}
                        className={`p-4 rounded-xl border text-left relative overflow-hidden transition-all ${selectedMacroPlan === 'muscleGain' ? 'border-[#3b82f6] bg-[#f5f9ff] ring-2 ring-[#3b82f6]/25 ring-offset-1' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                      >
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3b82f6] block">Muscle Gain</span>
                          <span className="text-xs text-slate-500 block">Surplus (+320)</span>
                        </div>
                        <div className="mt-4">
                          <span className="text-2xl font-black text-slate-navy font-mono">{calculation.muscleGain}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">kcal / day</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Realtime Macronutrient analysis preview */}
                  <div className="bg-[#f8fafc] border border-slate-200/80 p-4.5 rounded-2xl space-y-3 mt-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold uppercase text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-primary-teal" /> Estimated Daily Macros Splits
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Selected: <span className="font-bold capitalize text-primary-teal">{selectedMacroPlan} Target</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-none mb-1">Protein</span>
                        <span className="text-lg font-bold font-mono text-slate-navy">{macros.protein}g</span>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase mt-0.5">{macros.protein * 4} kcal</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <span className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none mb-1">Carbs</span>
                        <span className="text-lg font-bold font-mono text-slate-navy">{macros.carbs}g</span>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase mt-0.5">{macros.carbs * 4} kcal</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <span className="block text-[10px] font-bold text-teal-600 uppercase tracking-widest leading-none mb-1">Fats</span>
                        <span className="text-lg font-bold font-mono text-slate-navy">{macros.fat}g</span>
                        <span className="block text-[9px] text-slate-400 font-mono uppercase mt-0.5">{macros.fat * 9} kcal</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-[#475569] leading-normal text-left">
                      💡 Split formula presets: Protein target based on <strong>2g per kg bodyweight</strong> to maintain skeletal amino complexes. Fats set at <strong>22% of daily caloric intake</strong> for hormonal baseline support. Carbohydrate loads allocated to the remaining calorie threshold.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                  <Calculator className="w-14 h-14 text-slate-200 animate-bounce" />
                  <div className="max-w-xs space-y-1.5">
                    <h4 className="font-bold text-slate-navy text-sm">Formulator parameters require update</h4>
                    <p className="text-xs text-slate-400">
                      Slide or type the updated measurements in the parameters profile dock to recalculate results.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. HISTORY WEIGHT LEDGER PROGRESS LOGS */}
        {activeTab === 'history' && (
          <div className="bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 sm:p-8 space-y-6" id="history_tab">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-navy font-sans mb-1 flex items-center gap-2">
                  <History className="w-5.5 h-5.5 text-primary-teal" /> Physical Progress Tracker
                </h3>
                <p className="text-slate-500 text-xs text-left">
                  Saved biometric entries preserved in your direct browser sandbox data. Total entries: <strong>{historyList.length}</strong>
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleClearAllHistory}
                  disabled={historyList.length === 0}
                  className="px-4 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-semibold rounded-lg border border-transparent hover:border-red-200/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  Clear history
                </button>
              </div>
            </div>

            {historyList.length === 0 ? (
              <div className="py-20 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-4">
                <div className="inline-flex p-3 bg-soft-teal text-primary-teal rounded-full">
                  <Scale className="w-8 h-8" />
                </div>
                <div className="max-w-xs mx-auto space-y-1">
                  <h4 className="font-bold text-slate-navy text-sm">Weight progress log is empty</h4>
                  <p className="text-xs text-slate-400">
                    Use our matrix calculator panel to process body configurations, then hit "Log current entry" to register data.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="px-4 py-2 bg-primary-teal hover:bg-teal-dark font-bold text-white text-xs uppercase tracking-wider rounded-lg shadow cursor-pointer"
                >
                  Start First Calculation
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Custom Sparkline SVG chart using computed scale lines */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3" id="charts_box">
                  <div className="flex justify-between items-center text-xs">
                    <h4 className="font-bold text-slate-navy flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-primary-teal" /> Continuous Biometric Progress Curve (Weight trend in kg)
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Display graph boundaries: {Math.min(...historyList.map(h => h.weight))}kg — {Math.max(...historyList.map(h => h.weight))}kg
                    </span>
                  </div>
                  
                  {/* Robust and fully styled inline vector diagram */}
                  <div className="h-44 w-full relative pt-2">
                    <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                      {/* Grid Horizontal Guidelines */}
                      <line x1="0" y1="10" x2="500" y2="10" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="0" y1="50" x2="500" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="0" y1="90" x2="500" y2="90" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3,3" />

                      {/* Sparkline coordinates calculations logic */}
                      {(() => {
                        const reversed = [...historyList].reverse();
                        const weights = reversed.map(h => h.weight);
                        const minW = Math.min(...weights) - 3;
                        const maxW = Math.max(...weights) + 3;
                        const range = maxW - minW || 10;
                        
                        const points = reversed.map((h, i) => {
                          const x = reversed.length > 1 ? (i / (reversed.length - 1)) * 500 : 250;
                          const y = 100 - ((h.weight - minW) / range) * 80 - 10;
                          return `${x},${y}`;
                        }).join(" ");

                        // For filling region under the curve
                        const fillPoints = reversed.length > 1 
                          ? `0,100 ${points} 500,100`
                          : "0,100 250,50 500,100";

                        return (
                          <>
                            {reversed.length > 1 && (
                              <polygon
                                points={fillPoints}
                                fill="url(#sparklineGrad)"
                                opacity="0.15"
                              />
                            )}

                            {reversed.length > 1 && (
                              <polyline
                                fill="none"
                                stroke="#2a9d8f"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={points}
                              />
                            )}
                            
                            {/* SVG Gradient definitions */}
                            <defs>
                              <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2a9d8f" />
                                <stop offset="100%" stopColor="#2a9d8f" stopOpacity="0" />
                              </linearGradient>
                            </defs>

                            {/* Bullet points on every coordinates scatter */}
                            {reversed.map((h, i) => {
                              const x = reversed.length > 1 ? (i / (reversed.length - 1)) * 500 : 250;
                              const y = 100 - ((h.weight - minW) / range) * 80 - 10;
                              return (
                                <g key={h.id} className="group cursor-pointer">
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="4.5"
                                    className="fill-white stroke-primary-teal stroke-2 hover:r-6 hover:stroke-coral-accent transition-all"
                                  />
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
                    <span>📅 Past Records ({historyList[historyList.length-1].createdAt.toLocaleDateString()})</span>
                    <span>Most Recent Baseline ({historyList[0].createdAt.toLocaleDateString()})</span>
                  </div>
                </div>

                {/* Weights tables logs */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full text-xs text-slate-navy text-left bg-white">
                    <thead className="bg-[#f8fafc] text-slate-500 uppercase tracking-wider text-[10px] font-mono border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-4 font-bold">Registration Event Time</th>
                        <th className="px-4 py-4 font-bold">Weight Logged</th>
                        <th className="px-4 py-4 font-bold">Biometrics Saved</th>
                        <th className="px-4 py-4 font-bold">Muscle Overrides</th>
                        <th className="px-4 py-4 font-bold">Computed BMI</th>
                        <th className="px-4 py-4 font-bold">Calibrated TDEE</th>
                        <th className="px-5 py-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {historyList.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-all">
                          <td className="px-5 py-3.5 font-semibold text-slate-navy text-left">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>
                                {entry.createdAt.toLocaleDateString()} at {entry.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-bold font-mono text-primary-teal text-sm text-left">
                            {entry.weight} kg
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 text-left">
                            {entry.gender} • {entry.age} yrs • {entry.height} cm
                          </td>
                          <td className="px-4 py-3.5 text-left">
                            <span className="px-2 py-0.5 font-semibold text-[10px] uppercase rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {entry.athleteType}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono font-semibold text-slate-700 text-left">
                            {entry.bmi}
                          </td>
                          <td className="px-4 py-3.5 font-bold font-mono text-slate-navy text-left">
                            {entry.tdee} kcal
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteHistoryEntry(entry.id)}
                              className="p-1 px-2 hover:bg-red-50 hover:text-red-600 text-slate-400 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                              title="Delete log"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

        {/* 3. NUTRITIONAL INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 sm:p-8 space-y-6 text-left" id="insights_tab">
            <div className="border-b border-slate-100 pb-5">
              <h3 className="text-lg font-bold text-slate-navy font-sans mb-1 flex items-center gap-2">
                <PieChart className="w-5.5 h-5.5 text-primary-teal" /> Calibrated Macronutrient & Diet Strategies
              </h3>
              <p className="text-slate-500 text-xs text-left">
                Macro-metabolic ratios modeled securely based on raw physical attributes (height <strong>{height}cm</strong>, weight <strong>{weight}kg</strong>).
              </p>
            </div>

            {/* Split macro-planner & guidelines */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    1. Select Active Metaplan Target
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'fatLoss', label: 'Fat Loss (Energy Deficit)', kcal: calculation?.fatLoss, desc: 'Optimized for healthy tissue fat loss and cellular thermogenesis.' },
                      { key: 'maintenance', label: 'Weight Maintenance (Caloric Balance)', kcal: calculation?.maintenance, desc: 'Sustains current musculoskeletal tissue volume perfectly.' },
                      { key: 'muscleGain', label: 'Muscle Gain (Hypertrophy Surplus)', kcal: calculation?.muscleGain, desc: 'Provides active protein-synthesis surplus to build lean tissue mass.' }
                    ].map((plan) => (
                      <button
                        key={plan.key}
                        onClick={() => setSelectedMacroPlan(plan.key as any)}
                        className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all ${selectedMacroPlan === plan.key ? 'bg-white border-primary-teal shadow-md' : 'bg-transparent border-slate-200/60 hover:bg-white/50'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-navy">{plan.label}</span>
                          <span className="text-xs font-mono font-bold text-primary-teal bg-primary-teal/5 px-2 py-0.5 rounded">
                            {plan.kcal} kcal
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{plan.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Absolute Macros details calculation table */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Caloric Breakdown by Percentage
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-500">Protein Energy allocation</span>
                      <span className="font-bold text-slate- navy">~{( (macros.protein * 4) / macros.totalKcal * 100 ).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-500">Carbs Energy allocation</span>
                      <span className="font-bold text-slate-navy">~{( (macros.carbs * 4) / macros.totalKcal * 100 ).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-500">Fats Energy allocation</span>
                      <span className="font-bold text-slate-navy">~{( (macros.fat * 9) / macros.totalKcal * 100 ).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Guide card descriptions */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-[#f0f9ff] border border-sky-100 p-5 rounded-2xl space-y-2">
                  <h4 className="font-bold text-sm text-sky-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600" /> Amino-Acid Synthesis Strategy (Protein)
                  </h4>
                  <p className="text-xs text-sky-800 leading-relaxed">
                    Based on your weight of <strong>{weight}kg</strong>, FitMatrix targets a continuous protein profile load of <strong>{macros.protein}g</strong> daily. This represents 2.0 grams of protein per kilogram of body weight. During high energetic deficits (for fat reduction), elevated lean block loads are vital to prevent myofibrillar protein breakdown (catabolism).
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
                    High Performance Diet Rules
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="font-bold text-xs text-slate-navy block">Consistent Weigh-In schedule</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Weigh yourself once daily immediately on waking prior to food intake. Fluctuations of 1-1.5kg are physiologically benign due to salt density and muscle glycogen water retention.
                      </p>
                    </div>

                    <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="font-bold text-xs text-slate-navy block">Hydration balance indicators</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Drink 1 liter of fresh water per 30kg of body mass. Muscles store 3g of water for every gram of glycogen stored, maintaining cell volumization and nutrient kinetics.
                      </p>
                    </div>

                    <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="font-bold text-xs text-slate-navy block">Fat load source boundaries</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Limit trans or seed lipids. Prioritize raw plant fats (extra-virgin olive oil, unsalted walnuts, avocados) and whole egg structures to fuel androgen hormones securely.
                      </p>
                    </div>

                    <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="font-bold text-xs text-slate-navy block">Adjusting for physical fatigue</span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        If experiencing sustained muscle soreness or high chronic fatigue, transiently increase carbohydrates by 40g to replenish high depleted glycogen cycles.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
              
            </div>
          </div>
        )}

      </main>

      {/* Humble Elegant and Clean Footer */}
      <footer className="py-8 bg-white border-t border-slate-100 text-center text-xs text-slate-400 font-mono mt-auto flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold font-sans">
          <Dumbbell className="w-4 h-4 text-primary-teal" />
          <span>FITMATRIX PRO</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Precision Metabolic Software &copy; {new Date().getFullYear()}. All Data Secured Locally.
        </p>
      </footer>
    </div>
  );
}
