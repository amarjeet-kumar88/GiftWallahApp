import mongoose from "mongoose";
import { Address, IAddress } from "../models/Address.model";
import { ApiError } from "../utils/apiError";

export interface AddressInput {
  fullName?: string;
  name?: string;
  phone: string;
  pincode: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  landmark?: string;
}

// raw body ko normalize karne ka helper
const normalizeAddressInput = (raw: any): AddressInput => {
  const src = raw || {};

  return {
    fullName: src.fullName ?? src.name,
    name: src.name,
    phone: src.phone,
    pincode: src.pincode,
    line1: src.line1 ?? src.addressLine1,
    line2: src.line2 ?? src.addressLine2,
    city: src.city,
    state: src.state,
    landmark: src.landmark,
  };
};

const validateAddressInput = (data: AddressInput) => {
  if (!data.phone) throw new ApiError(400, "Phone is required");
  if (!data.pincode) throw new ApiError(400, "Pincode is required");
  if (!data.line1) throw new ApiError(400, "Address line is required");
  if (!data.city) throw new ApiError(400, "City is required");
  if (!data.state) throw new ApiError(400, "State is required");
};

/**
 * Profile / list ke liye: user ke saare addresses
 */
export const getAddressesForUser = async (userId: string) => {
  return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: 1 });
};

/**
 * Profile me naya address add karne ke liye
 */
export const createAddressForUser = async (
  userId: string,
  raw: any
): Promise<IAddress> => {
  const data = normalizeAddressInput(raw);      // <-- raw undefined ho to bhi safe
  // validateAddressInput(data);                   // <-- required fields check

  const hasAny = await Address.exists({ user: userId });

  const addr = await Address.create({
    user: new mongoose.Types.ObjectId(userId),
    fullName: data.fullName || data.name ,
    phone: data.phone,
    pincode: data.pincode,
    line1: data.line1,
    line2: data.line2,
    city: data.city,
    state: data.state,
    landmark: data.landmark,
    isDefault: !hasAny,
  });

  return addr;
};

/**
 * Profile me existing address update
 */
export const updateAddressForUser = async (
  userId: string,
  addressId: string,
  data: Partial<AddressInput>
): Promise<IAddress> => {
  const addr = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!addr) {
    throw new ApiError(404, "Address not found");
  }

  if (data.fullName || data.name) {
    addr.fullName = data.fullName || data.name || addr.fullName;
  }
  if (data.phone) addr.phone = data.phone;
  if (data.pincode) addr.pincode = data.pincode;
  if (data.line1) addr.line1 = data.line1;
  if (data.line2 !== undefined) addr.line2 = data.line2;
  if (data.city) addr.city = data.city;
  if (data.state) addr.state = data.state;
  if (data.landmark !== undefined) addr.landmark = data.landmark;

  await addr.save();
  return addr;
};

/**
 * Profile se address delete
 */
export const deleteAddressForUser = async (
  userId: string,
  addressId: string
) => {
  const addr = await Address.findOneAndDelete({
    _id: addressId,
    user: userId,
  });

  if (!addr) {
    throw new ApiError(404, "Address not found");
  }

  // agar default delete hua & koi aur address bacha hai -> usme ek ko default bana do
  if (addr.isDefault) {
    const another = await Address.findOne({ user: userId }).sort({
      createdAt: 1,
    });
    if (another) {
      another.isDefault = true;
      await another.save();
    }
  }

  return;
};

/**
 * Default address set karne ke liye
 */
export const setDefaultAddressForUser = async (
  userId: string,
  addressId: string
): Promise<IAddress> => {
  const addr = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!addr) {
    throw new ApiError(404, "Address not found");
  }

  // sab addresses ka default false
  await Address.updateMany(
    { user: userId, isDefault: true },
    { $set: { isDefault: false } }
  );

  addr.isDefault = true;
  await addr.save();

  return addr;
};

/**
 * Checkout ke time: ensure karo ki given address
 * SavedAddresses collection me bhi ho.
 * - agar same address already hai -> usko return
 * - warna new create (pehla ho to default true)
 */
export const ensureAddressSavedForUser = async (
  userId: string,
  raw: any
): Promise<IAddress> => {
  const data = normalizeAddressInput(raw);
  // validateAddressInput(data);

  // Same address already saved?
  const existing = await Address.findOne({
    user: userId,
    phone: data.phone,
    pincode: data.pincode,
    line1: data.line1,
    city: data.city,
    state: data.state,
  });

  if (existing) return existing;

  const hasAny = await Address.exists({ user: userId });

  const addr = await Address.create({
    user: new mongoose.Types.ObjectId(userId),
    fullName: data.fullName || data.name ,
    phone: data.phone,
    pincode: data.pincode,
    line1: data.line1,
    line2: data.line2,
    city: data.city,
    state: data.state,
    landmark: data.landmark,
    isDefault: !hasAny,
  });

  return addr;
};
