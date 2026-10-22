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
  check_in: string;
  check_out: string;
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