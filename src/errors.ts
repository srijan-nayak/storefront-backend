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

export const ProductNotFoundError: Error = Error(
  "Product with the given ID doesn't exist"
);

export const ProductFieldsIncorrectError: Error = Error(
  "Product has incorrect or empty fields"
);

export const OrderNotFoundError: Error = Error(
  "Order with the given ID doesn't exist"
);

export const OrderFieldsIncorrectError: Error = Error(
  "Order has incorrect or empty fields"
);

export const CompleteOrderFieldsIncorrectError: Error = Error(
  "Complete order has incorrect or empty fields"
);

export const UserOrdersNotFountError: Error = Error(
  "User doesn't have any orders"
);

export const UserActiveOrdersNotFoundError: Error = Error(
  "User doesn't have any active orders"
);

export const UserCompletedOrdersNotFoundError: Error = Error(
  "User doesn't have any completed orders"
);

export const OrderProductFieldsIncorrectError: Error = Error(
  "Order product has incorrect or empty fields"
);

export const httpStatus = (error: Error): number => {
  switch (error) {
    case AuthorizationError:
    case UserPasswordIncorrectError:
      return 401;
    case UserNotFoundError:
    case ProductNotFoundError:
    case OrderNotFoundError:
    case UserOrdersNotFountError:
    case UserActiveOrdersNotFoundError:
    case UserCompletedOrdersNotFoundError:
      return 404;
    case UserAlreadyExistsError:
      return 409;
    case UserFieldsIncorrectError:
    case ProductFieldsIncorrectError:
    case OrderFieldsIncorrectError:
    case OrderProductFieldsIncorrectError:
    case CompleteOrderFieldsIncorrectError:
      return 422;
    case DBError:
    default:
      return 500;
  }
};
