let expenses = [];
let total = 0;

const dateInput = document.getElementById("date");
const nameInput = document.getElementById("expenseName");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("addExpenseBtn");
const list = document.getElementById("expenseList");
const totalSpan = document.getElementById("total");
const doneBtn = document.getElementById("doneBtn");
const popup = document.getElementById("popup");

// Move to amount when Enter is pressed in expense name
nameInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        amountInput.focus();
    }
});

// Optional: Add expense when Enter is pressed in amount field
amountInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        addExpense();
    }
});


// Store initial date
dateInput.setAttribute('data-prev', dateInput.value);

// Prompt before changing date if unsaved data exists
dateInput.addEventListener('change', function() {
    const name = nameInput.value;
    const amount = amountInput.value;

    if (name !== '' || amount !== '') {
        const proceed = window.confirm("You have unsaved data. Do you really want to change the date?");
        if (!proceed) {
            // Revert to previous date
            this.value = this.getAttribute('data-prev'); 
            return;
        }
    }

    // Update previous date to new value
    this.setAttribute('data-prev', this.value);

    // Clear current unsaved expenses for new date
    expenses = [];
    renderExpenses();
});

addBtn.addEventListener("click", addExpense);

function addExpense() {
  const date = dateInput.value;
  const name = nameInput.value;
  const amount = Number(amountInput.value);

  if (!date || !name || amount <= 0) {
    alert("Fill all fields bro 😅");
    return;
  }

  expenses.push({ name, amount });
  nameInput.value = "";
  amountInput.value = "";

  renderExpenses();
}

function renderExpenses() {
  list.innerHTML = "";
  total = 0;

  expenses.forEach((exp, index) => {
    total += exp.amount;

    const card = document.createElement("div");
    card.className = "expense-card";
    card.innerHTML = `
      <b>${exp.name}</b> - ₹${exp.amount}
      <button onclick="editExpense(${index})">Edit</button>
      <button onclick="deleteExpense(${index})">Delete</button>
    `;
    list.appendChild(card);
  });

  totalSpan.innerText = total;
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  renderExpenses();
}

function editExpense(index) {
  nameInput.value = expenses[index].name;
  amountInput.value = expenses[index].amount;
  expenses.splice(index, 1);
  renderExpenses();
}

doneBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const date = dateInput.value;
  if (!date) {
    alert("Select date bro 😅");
    return;
  }

  if (expenses.length === 0) {
    alert("Add at least one expense bro 😅");
    return;
  }

  try {
    for (let exp of expenses) {
      await fetch("/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, name: exp.name, amount: exp.amount })
      });
    }

    popup.style.display = "flex";

    setTimeout(() => {
      window.location.href = "Ezsult.html";
    }, 1200);

  } catch (err) {
    alert("Backend error bro 😭");
    console.error(err);
  }
});
