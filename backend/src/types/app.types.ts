export type user_role = "admin" | "user";

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  phone: string;
  role: user_role;
  created_at?: Date;
}

export type new_user = Omit<User, "id" | "created_at">;

export interface PublicUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: user_role;
  created_at?: Date;
}

export interface Accomodations {
  id: number;
  name: string;
  description?: string;
  address: string;
  amenities: string[];
  star_rating: number;
  updated_at?: Date;
  pictures?: string[];
  province: string;
  rooms?: string[];
}

export type new_accomodation = Omit<Accomodations, "id">;

export interface Rooms {
  id: number;
  accommodation_id: number;
  room_type: string;
  price_per_night: number;
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
  created_at?: Date;
  status: booking_status;
}

export interface CreateBookingInput {
  user_id: number;
  accommodation_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}

//==================== Favourite & Review ==========================//
export interface Review {
  userId: number;
  accommodationId: number;
  rating: number;
  title?: string;
  comment: string;
};