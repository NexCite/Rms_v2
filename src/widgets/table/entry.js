self.onmessage = (props) => {
  const dataEntries = props.data.dataEntries;
  const searchEntries = props.data.searchEntries;

  var totalDebit = {},
    totalCredit = {},
    currencies = {};

  var totalDebitRate = 0,
    totalCreditRate = 0;

  dataEntries.forEach((entry) => {
    const { three_digit, account, two_digit, more_than_four_digit } =
      searchEntries;
    const three_digit_ids = three_digit.map((res) => res.id),
      account_ids = account?.map((res) => res.id),
      two_digit_ids = two_digit?.map((res) => res.id),
      more_digit_ids = more_than_four_digit?.map((res) => res.id);

    entry.sub_entries.forEach((subEntry) => {
      var amount = 0;

      if (
        account_ids.length > 0 &&
        two_digit_ids.length === 0 &&
        three_digit_ids.length === 0 &&
        more_digit_ids.length === 0
      ) {
        if (account_ids.includes(subEntry.account_entry_id)) {
          amount = subEntry.amount;
        }
      }
      if (two_digit_ids.length > 0) {
        if (
          two_digit_ids.includes(subEntry.two_digit_id) ||
          two_digit_ids.includes(subEntry.three_digit?.two_digit_id) ||
          two_digit_ids.includes(
            subEntry.more_than_four_digit?.three_digit?.two_digit_id
          ) ||
          two_digit_ids.includes(subEntry.account_entry?.two_digit_id) ||
          two_digit_ids.includes(
            subEntry.account_entry?.three_digit?.two_digit_id
          ) ||
          two_digit_ids.includes(
            subEntry.account_entry?.more_than_four_digit?.three_digit
              ?.two_digit_id
          ) ||
          two_digit_ids.includes(subEntry.reference?.two_digit_id) ||
          two_digit_ids.includes(
            subEntry.reference?.three_digit?.two_digit_id
          ) ||
          two_digit_ids.includes(
            subEntry.reference?.more_than_four_digit?.three_digit?.two_digit_id
          )
        ) {
          amount = subEntry.amount;
        }
      } else if (three_digit_ids.length > 0) {
        if (
          three_digit_ids.includes(subEntry.three_digit_id) ||
          three_digit_ids.includes(
            subEntry.more_than_four_digit?.three_digit_id
          ) ||
          three_digit_ids.includes(subEntry.account_entry?.three_digit_id) ||
          three_digit_ids.includes(
            subEntry.account_entry?.more_than_four_digit?.three_digit_id
          ) ||
          three_digit_ids.includes(subEntry.reference?.three_digit_id) ||
          three_digit_ids.includes(
            subEntry.reference?.more_than_four_digit?.three_digit_id
          )
        ) {
          amount = subEntry.amount;
        }
      } else if (more_digit_ids.length > 0) {
        if (
          more_digit_ids.includes(subEntry.more_than_four_digit_id) ||
          more_digit_ids.includes(
            subEntry.account_entry?.more_than_four_digit_id
          ) ||
          more_digit_ids.includes(subEntry.reference?.more_than_four_digit_id)
        ) {
          amount = subEntry.amount;
        }
      }

      if (amount === 0) {
        if (subEntry.type === "Credit") {
          if (totalDebit[entry.currency.symbol]) {
            totalDebit[entry.currency.symbol] += subEntry.amount;
          } else {
            if (!currencies[entry.currency.symbol]) {
              currencies[entry.currency.symbol] = true;
            }
            totalDebit[entry.currency.symbol] = subEntry.amount;
          }
          if (entry.rate) {
            totalCreditRate += subEntry.amount / entry.rate;
          }
        } else if (totalCredit[entry.currency.symbol]) {
          totalCredit[entry.currency.symbol] += subEntry.amount;
          if (entry.rate) {
            totalDebitRate += subEntry.amount / entry.rate;
          }
        } else {
          if (!currencies[entry.currency.symbol]) {
            currencies[entry.currency.symbol] = true;
          }
          totalCredit[entry.currency.symbol] = subEntry.amount;
          if (entry.rate) {
            totalDebitRate += subEntry.amount / entry.rate;
          }
        }
      } else {
      }

      if (two_digit_ids.includes(subEntry.two_digit_id)) {
        return;
      }
      if (three_digit_ids.includes(subEntry.three_digit_id)) {
        return;
      }
      if (more_digit_ids.includes(subEntry.more_than_four_digit_id)) {
        return;
      }

      if (
        account_ids.length > 0 &&
        two_digit_ids.length === 0 &&
        three_digit_ids.length === 0 &&
        more_digit_ids.length === 0
      ) {
        if (account_ids.includes(subEntry.account_entry_id)) {
          return;
        } else {
          return;
        }
      }
    });
  });

  self.postMessage({
    totalDebitRate,
    totalCreditRate,
    totalDebit,
    totalCredit,
    currencies,
  });
};
