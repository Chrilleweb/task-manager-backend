const request = require("supertest");
const server = require("../server");
const User = require("../models/User");

const user = {
  username: "testuser",
  password: "testpassword",
};

beforeEach(async () => {
  await User.deleteOne({ username: "testuser" });
  await User(user).save();
});

afterAll(async () => {
  await User.deleteOne({ username: "testuser" });
});

test("should register a new user", () => {
  request(server).post("/register")
    .send({
      username: "testuser1",
      password: "password",
    })
    .expect(201);
});

test("should login a user", () => {
  request(server).post("/login")
    .send({
      username: "testuser",
      password: "testpassword",
    })
    .expect(200);
});

test("should not login a user with invalid credentials", () => {
  request(server).post("/login")
    .send({
      username: "testuser",
      password: "wrongpassword",
    })
    .expect(401);
});

test("should not register a user with an existing username", () => {
  request(server).post("/register")
    .send({
      username: "testuser",
      password: "password",
    })
    .expect(400);
});
