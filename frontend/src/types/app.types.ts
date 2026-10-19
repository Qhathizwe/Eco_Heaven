
//=========== Users ===================//
export type user_role = "admin" | "user";

export interface User {
    id: number,
    name: string,
    surname: string,
    email: string,
    password: string,
    phone: string,
    role: user_role,
    created_at?: Date, 
}

//=========== Accomodations ===================//

export interface Accomodations {
    id: number,
    name: string,
    description?: string,
    address: string,
    amenities: string[],
    star_rating: number,
    updated_at?: Date,
    pictures?: string[],
    province: string,
    rooms?: string[]
};

export type new_accomodation = Omit<Accomodations, 'id' >;

 //===================== Rooms ===================//
 export interface Rooms {
    id: number,
    accomodation_id: number;
    room_type: string;
    price_per_night: number;
    description: string;
    pictures: string[];
    is_available: boolean
 };
