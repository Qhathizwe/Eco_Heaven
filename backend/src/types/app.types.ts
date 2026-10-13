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
 export type new_user = Omit<User, 'id' >;

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

