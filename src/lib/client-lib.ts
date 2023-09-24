export function getUserInfoClient(
  data: any,
  credit?: boolean,
  debit?: boolean
) {
  if (data) {
    if (!credit && data.account && debit) {
      return {
        username: data.account.username,
        node: "account",
        id: data.account_id,
      };
    } else if (!credit && data.broker && debit) {
      return {
        username: data.broker.username,
        node: "broker",
        id: data.broker_id,
      };
    } else if (!credit && data.client && debit) {
      return {
        username: data.client.username,
        node: "client",
        id: data.client_id,
      };
    } else if (!credit && data.employee && debit) {
      return {
        username: data.employee.username,
        node: "employee",
        id: data.employee_id,
      };
    } else if (!credit && data.trader && debit) {
      return {
        username: data.trader.username,
        node: "trader",
        id: data.trader_id,
      };
    } else if (!credit && data.account_credit && debit) {
      return {
        username: data.account_credit.username,
        node: "account",
        id: data.account_credit_id,
      };
    } else if (data.broker_credit) {
      return {
        username: data.broker_credit.username,
        node: "broker",
        id: data.broker_credit_id,
      };
    } else if (data.client_credit) {
      return {
        username: data.client_credit.username,
        node: "client",
        id: data.client_credit_id,
      };
    } else if (data.employee_credit) {
      return {
        username: data.employee_credit.username,
        node: "employee",
        id: data.employee_credit_id,
      };
    } else if (data.trader_credit) {
      return {
        username: data.trader_credit.username,
        node: "trader",
        id: data.trader_credit_id,
      };
    }
  }
  return { username: undefined, node: undefined, id: undefined };
}
export function getCurrenecyInfoClient(data: any) {
  if (data.invoice) {
    return data.invoice.currency_id
      ? data.invoice.currency.symbol
      : data.invoice.account.currency.symbol;
  }

  return data.currency_id ? data.currency.symbol : data.account.currency.symbol;
}
