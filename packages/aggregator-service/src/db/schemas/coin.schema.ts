import mongoose from "mongoose";
import { PriceSchema } from "./price.schema";
const { Schema } = mongoose;

const CoinSchema = new Schema({
  name: String,
  exchange: String,
  symbol: String,
  date: { type: Date, default: Date.now },
  priceList: [PriceSchema],
});
