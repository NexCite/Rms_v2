import { Currency, Invoice } from "@prisma/client";
import CurrencyInterface from "@rms/interfaces/CurrencyInterface";
import InvoiceInterface from "@rms/interfaces/InvoiceInterface";
import SubCategoryInterface from "@rms/interfaces/SubCategoryInterface";
import { FormatNumberWithFixed } from "./global";
import { getCategoriesByIds } from "@rms/services/CategoryService";

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

export function getSubCategoryType(props: {
  currencies: CurrencyInterface[];
  invoices: InvoiceInterface[];
}): {
  [k in symbol]: {
    ["debit"]: {
      invoice: {
        count: number;
        total: number;
      };
      payment: {
        count: number;
        total: number;
      };
    };
    ["credit"]: {
      invoice: {
        count: number;
        total: number;
      };
      payment: {
        count: number;
        total: number;
      };
    };
  };
} {
  var data: any = {};
  props.currencies.forEach((e) => {
    data[e.symbol] = {
      ["debit"]: {
        invoice: {
          count: 0,
          total: 0,
        },
        payment: {
          count: 0,
          total: 0,
        },
      },
      ["credit"]: {
        invoice: {
          count: 0,
          total: 0,
        },
        payment: {
          count: 0,
          total: 0,
        },
      },
    };

    var invoice = props.invoices.filter(
      (res) =>
        (res.account
          ? res.account.currency.symbol === e.symbol
          : res.currency.symbol === e.symbol) && res.status === "Enable"
    );
    invoice
      .filter((res) => res.status === "Enable")
      .forEach((res) => {
        if (res.debit !== null) {
          if (res.debit) {
            data[e.symbol]["debit"].invoice.count += 1;
            data[e.symbol]["debit"].invoice.total += res.amount;
            res.payments
              .filter((res) => res.status === "Enable")
              .forEach((r) => {
                data[e.symbol]["debit"].payment.total += r.amount;
                data[e.symbol]["debit"].payment.count += 1;
              });
          } else {
            data[e.symbol]["credit"].invoice.count += 1;
            data[e.symbol]["credit"].invoice.total += res.amount;
            res.payments
              .filter((res) => res.status === "Enable")
              .forEach((r) => {
                data[e.symbol]["credit"].payment.total += r.amount;
                data[e.symbol]["credit"].payment.count += 1;
              });
          }
        } else {
          switch (res.debit) {
            case true:
              data[e.symbol]["debit"].invoice.count += 1;
              data[e.symbol]["debit"].invoice.total += res.amount;
              res.payments
                .filter((res) => res.status === "Enable")
                .forEach((r) => {
                  data[e.symbol]["debit"].payment.total += r.amount;
                  data[e.symbol]["debit"].payment.count += 1;
                });

              break;

            case false:
              data[e.symbol]["debit"].invoice.count += 1;
              data[e.symbol]["debit"].invoice.total += res.amount;
              res.payments
                .filter((res) => res.status === "Enable")
                .forEach((r) => {
                  data[e.symbol]["debit"].payment.total += r.amount;
                  data[e.symbol]["debit"].payment.count += 1;
                });
              break;

            default:
              break;
          }
        }
      });
  });
  return data;
}

export async function ExportCatagory(props: any) {
  const expo = [];

  const category = await getCategoriesByIds(props.ids);
  category.result.map((res) => {
    props.expo.push(["Category Name", "Category Key"], [res.name, res.key]);
    const sub_categories = res.sub_categories;

    var subData = sub_categories.map((res) => res.invoices).flat(1);

    const sub_categoriesResult = getSubCategoryType({
      currencies: props.currencies,
      invoices: subData,
    });

    props.expo.push(["Sub Categories"]);

    sub_categories.map((subC) => {
      props.expo.push(["Key", "Name"]);
      props.expo.push([subC.key, subC.name]);
      props.expo.push([
        "Currney",
        "Debit",
        "Credit",
        "None",
        "Adversaries",
        "Adversaries_Credit",
        "Adversaries_Debit",
        "Principles",
        "Principles_Credit",
        "Principles_Debit",
        "Virtual",
      ]);
      props.currencies.map((res) => {
        props.expo.push([
          res.symbol,
          res.symbol +
            FormatNumberWithFixed(
              sub_categoriesResult[res.symbol]["Debit"].invoice.total
            ),

          res.symbol +
            FormatNumberWithFixed(
              sub_categoriesResult[res.symbol]["Credit"].invoice.total
            ),
          res.symbol +
            FormatNumberWithFixed(
              sub_categoriesResult[res.symbol]["None"].invoice.total
            ),
          res.symbol +
            FormatNumberWithFixed(
              sub_categoriesResult[res.symbol]["Adversaries"].invoice.total
            ),

          res.symbol +
            FormatNumberWithFixed(
              sub_categoriesResult[res.symbol]["Adversaries_Credit"].invoice
                .total
            ),
          res.symbol +
            FormatNumberWithFixed(
              sub_categoriesResult[res.symbol]["Adversaries_Debit"].invoice
                .total
            ),
          res.symbol +
            FormatNumberWithFixed(
              sub_categoriesResult[res.symbol]["Principles"].invoice.total
            ),
          res.symbol +
            FormatNumberWithFixed(
              sub_categoriesResult[res.symbol]["Principles_Credit"].invoice
                .total
            ),
          res.symbol +
            FormatNumberWithFixed(
              sub_categoriesResult[res.symbol]["Principles_Debit"].invoice.total
            ),
          res.symbol +
            FormatNumberWithFixed(
              sub_categoriesResult[res.symbol]["Virtual"].invoice.total
            ),
        ]);
      });
    });
  });
}

export function ExportSubCatagory(props: any) {
  const sub_categories = props.table
    .getSelectedRowModel()
    .rows.map((res) => res.original) as SubCategoryInterface[];

  var subData = sub_categories.map((res) => res.invoices).flat(1);

  const sub_categoriesResult = getSubCategoryType({
    currencies: props.currencies,
    invoices: subData,
  });

  props.expo.push(
    ["Category Name", "Category Key"],
    [sub_categories[0].category.name, sub_categories[0].category.key]
  );
  props.expo.push(["Sub Categories"]);

  sub_categories.map((subC) => {
    props.expo.push(["Key", "Name"]);
    props.expo.push([subC.key, subC.name]);
    props.expo.push([
      "Currney",
      "Debit",
      "Credit",
      "None",
      "Adversaries",
      "Adversaries_Credit",
      "Adversaries_Debit",
      "Principles",
      "Principles_Credit",
      "Principles_Debit",
      "Virtual",
    ]);
    props.currencies.map((res) => {
      props.expo.push([
        res.symbol,
        res.symbol +
          FormatNumberWithFixed(
            sub_categoriesResult[res.symbol]["Debit"].invoice.total
          ),

        res.symbol +
          FormatNumberWithFixed(
            sub_categoriesResult[res.symbol]["Credit"].invoice.total
          ),
        res.symbol +
          FormatNumberWithFixed(
            sub_categoriesResult[res.symbol]["None"].invoice.total
          ),
        res.symbol +
          FormatNumberWithFixed(
            sub_categoriesResult[res.symbol]["Adversaries"].invoice.total
          ),

        res.symbol +
          FormatNumberWithFixed(
            sub_categoriesResult[res.symbol]["Adversaries_Credit"].invoice.total
          ),
        res.symbol +
          FormatNumberWithFixed(
            sub_categoriesResult[res.symbol]["Adversaries_Debit"].invoice.total
          ),
        res.symbol +
          FormatNumberWithFixed(
            sub_categoriesResult[res.symbol]["Principles"].invoice.total
          ),
        res.symbol +
          FormatNumberWithFixed(
            sub_categoriesResult[res.symbol]["Principles_Credit"].invoice.total
          ),
        res.symbol +
          FormatNumberWithFixed(
            sub_categoriesResult[res.symbol]["Principles_Debit"].invoice.total
          ),
        res.symbol +
          FormatNumberWithFixed(
            sub_categoriesResult[res.symbol]["Virtual"].invoice.total
          ),
      ]);
    });
  });
}
