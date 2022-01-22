export const DBError: Error = Error("Couldn't successfully query database");

export const AuthorizationError: Error = Error(
  "Authorization token missing or invalid"
);

export const UserNotFoundError: Error = Error(
  "User with the given ID doesn't exist"
);

export const UserFieldsIncorrectError: Error = Error(
  "User to be inserted has incorrect or empty fields"
);

export const UserAlreadyExistsError: Error = Error(
  "User with the given ID already exists"
);

export const UserPasswordIncorrectError: Error = Error(
  "Incorrect password for the given user ID"
);