import { Address } from "../models/Address.model";
import { ApiError } from "../utils/apiError";

interface AddressInput {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export const createAddress = async (userId: string, data: AddressInput) => {
  if (data.isDefault) {
    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
  }

  const address = await Address.create({
    user: userId,
    ...data
  });

  return address;
};

export const getUserAddresses = async (userId: string) => {
  return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  data: Partial<AddressInput>
) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  if (data.isDefault === true) {
    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
  }

  Object.assign(address, data);
  await address.save();
  return address;
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await Address.findOneAndDelete({ _id: addressId, user: userId });
  if (!address) {
    throw new ApiError(404, "Address not found");
  }
};
