import { Address, IAddress } from "../models/Address.model";
import { ApiError } from "../utils/apiError";

export const getAddressesForUser = async (userId: string) => {
  return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

export const createAddressForUser = async (
  userId: string,
  payload: Partial<IAddress>
) => {
  const address = await Address.create({
    user: userId,
    fullName: payload.fullName,
    phone: payload.phone,
    pincode: payload.pincode,
    line1: payload.line1,
    line2: payload.line2,
    city: payload.city,
    state: payload.state,
    landmark: payload.landmark,
    isDefault: payload.isDefault ?? false,
  });

  // agar isDefault true hai to baaki ko false kar do
  if (address.isDefault) {
    await Address.updateMany(
      { user: userId, _id: { $ne: address._id } },
      { $set: { isDefault: false } }
    );
  }

  return address;
};

export const updateAddressForUser = async (
  userId: string,
  addressId: string,
  payload: Partial<IAddress>
) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new ApiError(404, "Address not found");

  Object.assign(address, {
    fullName: payload.fullName ?? address.fullName,
    phone: payload.phone ?? address.phone,
    pincode: payload.pincode ?? address.pincode,
    line1: payload.line1 ?? address.line1,
    line2: payload.line2 ?? address.line2,
    city: payload.city ?? address.city,
    state: payload.state ?? address.state,
    landmark: payload.landmark ?? address.landmark,
  });

  if (typeof payload.isDefault === "boolean") {
    address.isDefault = payload.isDefault;
  }

  await address.save();

  if (address.isDefault) {
    await Address.updateMany(
      { user: userId, _id: { $ne: address._id } },
      { $set: { isDefault: false } }
    );
  }

  return address;
};

export const deleteAddressForUser = async (userId: string, addressId: string) => {
  const address = await Address.findOneAndDelete({ _id: addressId, user: userId });
  if (!address) throw new ApiError(404, "Address not found");
  return address;
};

export const setDefaultAddressForUser = async (userId: string, addressId: string) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new ApiError(404, "Address not found");

  await Address.updateMany(
    { user: userId },
    { $set: { isDefault: false } }
  );

  address.isDefault = true;
  await address.save();

  return address;
};
