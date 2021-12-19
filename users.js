var user = {
    "userName": "lala",
    "password": "123456",
    "email": "lmail@gmail.com",
    "birthDate": new Date("1994-01-01")
}

db.users.insertOne(user)