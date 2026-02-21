const { db } = require('../config/firebase');

const USERS_COLLECTION = 'users';

async function createUser(name, email, hashedPassword) {
  const userRef = db.collection(USERS_COLLECTION).doc(); // Auto-ID
  const user = {
    id: userRef.id,
    name,
    email,
    password: hashedPassword,
    created_at: new Date().toISOString()
  };
  await userRef.set(user);
  return user;
}

async function findUserByEmail(email) {
  const snapshot = await db.collection(USERS_COLLECTION).where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

async function findUserById(id) {
  const doc = await db.collection(USERS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return doc.data();
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};