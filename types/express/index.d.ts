import express from "express";


/* This file seems to have no effect. */


declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
