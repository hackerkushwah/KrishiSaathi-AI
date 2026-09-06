export type Language = 'en' | 'hi';

export type GrowthStage = 
  | 'sowing' 
  | 'germination' 
  | 'vegetative' 
  | 'flowering' 
  | 'pod_formation' 
  | 'maturity' 
  | 'harvest';

export type SoilType = 
  | 'black' 
  | 'alluvial' 
  | 'red' 
  | 'laterite' 
  | 'sandy_loam' 
  | 'clay';

export interface FarmerProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photo_url?: string;
  language: Language;
  created_at: string;
  updated_at: string;
  is_demo?: boolean;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  state: string;
  district: string;
  village?: string;
  acres: number;
  soil_type: SoilType;
  crop_name: string;
  crop_variety?: string;
  sowing_date?: string;
  growth_stage: GrowthStage;
  health_score: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  is_demo?: boolean;
}

export interface WeatherData {
  temperature: number;
  feels_like: number;
  condition: string;
  condition_code: string;
  humidity: number;
  wind_speed: number;
  rain_probability: number;
  uv_index: number;
  spray_window: 'good' | 'moderate' | 'poor';
  spray_reason: string;
  forecast: {
    day: string;
    day_hi: string;
    temp_max: number;
    temp_min: number;
    condition: string;
    rain_prob: number;
  }[];
  last_updated: string;
  is_demo: boolean;
}

export interface SatelliteIntelligence {
  observation_date: string;
  ndvi: number; // 0.0 - 1.0 (Vegetation Index)
  ndvi_status: 'excellent' | 'healthy' | 'moderate' | 'stressed';
  crop_stress: 'low' | 'medium' | 'high';
  soil_moisture_pct: number;
  cloud_cover_pct: number;
  resolution_meters: number;
  field_uniformity_pct: number;
  is_demo: boolean;
  provider: string;
}

export interface SoilIntelligence {
  soil_type: SoilType;
  nitrogen_kg_ha: number;
  phosphorus_kg_ha: number;
  potassium_kg_ha: number;
  ph: number;
  organic_carbon_pct: number;
  electrical_conductivity: number;
  health_status: 'optimal' | 'moderate' | 'deficient';
  recommendations: string[];
}

export interface Advisory {
  id: string;
  user_id: string;
  farm_id: string;
  title: string;
  title_hi?: string;
  query: string;
  category: 'crop' | 'weather' | 'disease' | 'soil' | 'irrigation';
  summary: string;
  summary_hi?: string;
  possible_causes: string[];
  things_to_check: string[];
  immediate_action: string[];
  weather_consideration: string;
  prevention: string[];
  when_to_seek_help: string;
  confidence: number;
  reasoning: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  is_saved?: boolean;
}

export interface DiseaseScan {
  id: string;
  user_id: string;
  farm_id: string;
  image_url: string;
  crop_name: string;
  identified_crop?: string;
  identified_crop_hi?: string;
  confidence_crop_identification?: number;
  possible_issue: string;
  possible_issue_hi?: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms_detected: string[];
  immediate_action: string[];
  prevention: string[];
  when_to_seek_help: string;
  image_quality: 'good' | 'adequate' | 'blurry';
  disclaimer: string;
  created_at: string;
}

export interface FarmContextPayload {
  farmer_name: string;
  location: string;
  crop: string;
  acres: number;
  soil_type: string;
  growth_stage: string;
  language: Language;
}
