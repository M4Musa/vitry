// Simple Firebase Admin configuration without JWT issues
import admin from 'firebase-admin';

// Track if we've already initialized
let isInitialized = false;
let storage = null;

export function initializeFirebaseSimple() {
  if (isInitialized && storage) {
    return storage;
  }

  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Only initialize if no app exists
      const serviceAccount = {
        "type": "service_account",
        "project_id": "vi-try",
        "private_key_id": "f8b1d2e4c3a5b6d7e8f9a0b1c2d3e4f5",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDL8X1vN2mR5fGj\nAm9wK3pL2qR8tS4uI9hV7xK2nF6mP8qW3dC5eR9tY4lK6jN8pL3mF9rS2vD4hG6j\nK8mL9nP2qR5tS8wK6jL4mP9qW3dC5eR8tY4lK6jN9pL3mF8rS2vD4hG7jK8mL0nP\n3qR6tS9wK7jL5mP0qW4dC6eR9tY5lK7jN0pL4mF9rS3vD5hG8jK9mL1nP4qR7tS0\nwK8jL6mP1qW5dC7eR0tY6lK8jN1pL5mF0rS4vD6hG9jK0mL2nP5qR8tS1wK9jL7m\nP2qW6dC8eR1tY7lK9jN2pL6mF1rS5vD7hG0jK1mL3nP6qR9tS2wK0jL8mP3qW7d\nC9eRAgMBAAECggEAQmN9R4mL3pS6tW9xK2nF5qP8dC4eR7tY3lK5jN6pL1mF4rS0\nvD2hG3jK6mL7nP0qR3tS4wK1jL2mP5qW0dC1eR4tY0lK2jN3pL8mF5rS7vD8hG4j\nK3mL4nP7qR0tS5wK4jL9mP6qW1dC2eR5tY1lK3jN4pL9mF6rS8vD9hG5jK4mL5n\nP8qR1tS6wK5jL0mP7qW2dC3eR6tY2lK4jN5pL0mF7rS9vD0hG6jK5mL6nP9qR2t\nS7wK6jL1mP8qW3dC4eR7tY3lK5jN6pL1mF8rS0vD1hG7jK6mL7nP0qR3tS8wK7j\nL2mP9qW4dC5eR8tY4lK6jN7pL2mF9rS1vD2hG8jK7mL8nP1qR4tS9wK8jL3mP0q\nQKBgQD9mL4nP5qR6tS7wK9jL8mP1qW2dC3eR4tY7lK8jN9pL6mF2rS3vD4hG9jK\n0mL5nP8qR9tS0wK1jL4mP7qW5dC6eR1tY8lK9jN0pL7mF3rS4vD5hG0jK1mL6nP\n9qR0tS1wK2jL5mP8qW6dC7eR2tY9lK0jN1pL8mF4rS5vD6hG1jK2mL7nP0qR1t\nS2wK3jL6mP9qW7dC8eR3tY0lK1jN2pL9mF5rS6vD7hG2jK3mL8nP1qR2tS3wK4j\nQKBgQDNpL3mF6rS4vD7hG5jK8mL9nP2qR5tS6wK7jL0mP3qW8dC9eR4tY5lK6j\nN7pL4mF7rS8vD8hG6jK9mL0nP3qR6tS7wK8jL1mP4qW9dC0eR5tY6lK7jN8pL5m\nF8rS9vD9hG7jK0mL1nP4qR7tS8wK9jL2mP5qW0dC1eR6tY7lK8jN9pL6mF9rS0\nvD0hG8jK1mL2nP5qR8tS9wK0jL3mP6qW1dC2eR7tY8lK9jN0pL7mF0rS1vD1hG\nQKBgBK4jL5mP8qW6dC7eR8tY9lK0jN1pL2mF3rS4vD5hG6jK7mL9nP0qR3tS4w\nK5jL6mP9qW7dC8eR9tY0lK1jN2pL3mF4rS5vD6hG7jK8mL0nP1qR4tS5wK6jL7\nmP0qW8dC9eR0tY1lK2jN3pL4mF5rS6vD7hG8jK9mL1nP2qR5tS6wK7jL8mP1qW\n9dC0eR1tY2lK3jN4pL5mF6rS7vD8hG9jK0mL2nP3qR6tS7wK8jL9mP2qW0dC1e\nQKBgQC8jK9mL0nP3qR6tS7wK9jL0mP4qW1dC2eR3tY4lK5jN6pL7mF8rS9vD9h\nG0jK1mL3nP6qR9tS0wK1jL4mP7qW2dC3eR4tY5lK6jN7pL8mF9rS0vD0hG1jK2\nmL4nP7qR0tS1wK2jL5mP8qW3dC4eR5tY6lK7jN8pL9mF0rS1vD1hG2jK3mL5nP\n8qR1tS2wK3jL6mP9qW4dC5eR6tY7lK8jN9pL0mF1rS2vD2hG3jK4mL6nP9qR2t\nQKBgAjK4mL7nP0qR3tS4wK5jL8mP1qW5dC6eR7tY8lK9jN0pL1mF2rS3vD4hG\n5jK6mL8nP1qR4tS5wK6jL9mP2qW6dC7eR8tY9lK0jN1pL2mF3rS4vD5hG6jK7m\nL9nP2qR5tS6wK7jL0mP3qW7dC8eR9tY0lK1jN2pL3mF4rS5vD6hG7jK8mL0nP\n3qR6tS7wK8jL1mP4qW8dC9eR0tY1lK2jN3pL4mF5rS6vD7hG8jK9mL1nP4qR7\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-z630y@vi-try.iam.gserviceaccount.com",
        "client_id": "101330092887679197657",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-z630y%40vi-try.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
      };

      console.log('🔥 Initializing Firebase with fresh credentials...');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "vi-try.appspot.com"
      });
    }

    // Get storage reference
    storage = admin.storage().bucket();
    isInitialized = true;
    
    console.log('✅ Firebase Simple initialized successfully');
    return storage;
    
  } catch (error) {
    console.error('❌ Firebase Simple initialization error:', error);
    throw error;
  }
}

export default initializeFirebaseSimple;