export type user_role = "admin" | "user";

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: user_role;
  created_at?: string;
}

export interface Accomodations {
  id: number;
  name: string;
  description?: string;
  address: string;
  amenities: string[];
  star_rating: number;
  updated_at?: string;
  pictures?: string[];
  province: string;
  rooms?: string[];
}

export type new_accomodation = Omit<Accomodations, "id">;

export interface Rooms {
  id: number;
  accommodation_id: number;
  room_type: string;
  price_per_night: number | string;
  description: string;
  pictures: string[];
  is_available: boolean;
}

export type booking_status =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface Booking {
  id: number;
  user_id: number;
  accommodation_id: number;
  room_id: number;
  check_in: Date;
  check_out: Date;
  guests: number;
  status: booking_status;
  created_at?: string;
  accommodation_name?: string;
  accommodation_address?: string;
  accommodation_pictures?: string[];
  room_type?: string;
  price_per_night?: number | string;
}

export type new_booking = Omit<Booking, "id">;

//==================== Favourite & Review ==========================//
export interface Review {
  userId: number;
  accommodationId: number;
  rating: number;
  title?: string;
  comment: string;
};

//===================== User Profile  ==========================//
export interface UserProfile {
  id?: number;
  name?: string;
  first_name?: string;
  surname?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  created_at?: string;
  profile_picture?: string;
}

//===================== Favourite Accommodation  ==========================//
export interface FavouriteAccommodation {
  id: number;
  name: string;
  address?: string;
  province?: string;
  star_rating?: number;
  pictures?: string[] | string;
  description?: string;
}