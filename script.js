const input = document.getElementById("card-input");
const addBtn = document.getElementById("add-btn");
const columnIds = ["todo", "doing", "done"]

// Load saved cards
let cards = JSON.parse(localStorage.getItem("cards")) || [];

// Save the list to localStorage
function saveCards() {
    localStorage.setItem("cards", JSON.stringify(cards));
}

function renderCard(cardData) {
    const card = document.createElement("div");
    card.className = "board-card bg-base-100 rounded-lg shadow p-3 mb-3 flex flex-row justify-between items-center gap-2 border border-base-300 hover:border-primary transition-colors cursor-grab";
    card.dataset.id = cardData.id; // So we know which card this is after dragging

    const span = document.createElement("span");
    span.textContent = cardData.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "x";
    deleteBtn.className = "btn btn-xs btn-ghost btn-circle";
    deleteBtn.addEventListener("click", () => {
        card.remove();
        cards = cards.filter((c) => c.id !== cardData.id);
        saveCards();
    });

    card.appendChild(span);
    card.appendChild(deleteBtn);

    // put the card in its column (old cards without a column go to "todo")
    const column = document.getElementById(cardData.column || "todo");
    column.appendChild(card);
}

function addCard() {
    const text = input.value.trim();
    if (text === "") return; // Don't add empty cards

    const newCard = { id: Date.now(), text: text, column: "todo" };
    cards.push(newCard); // Add to list
    saveCards(); // Save
    renderCard(newCard); // Draw it
    input.value = ""; // Clear the input
}

// After a drag, read every column from the page and rebuild the list
function updateFromPage() {
    const newCards = [];

    columnIds.forEach((columnId) => {
        const column = document.getElementById(columnId);

        for (const cardEl of column.querySelectorAll(".board-card")) {
            const id = Number(cardEl.dataset.id);
            const cardData = cards.find((c) => c.id === id);
            cardData.column = columnId;
            newCards.push(cardData);
        }
    });

    cards = newCards;
    saveCards();
}

// Make every column draggable
columnIds.forEach((columnId) => {
    new Sortable(document.getElementById(columnId), {
        group: "board", // same group = cards can move between columns
        animation: 150, // smooth sliding
        draggable: ".board-card",
        emptyInsertThreshold: 40, // Easier to drop into empty columns
        forceFallback: true, // Smoother dragging in most browsers
        onEnd: updateFromPage // run after every drop
    });
});

// Add a new card with clicking the button
addBtn.addEventListener("click", addCard);

// Add a button with enter key
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addCard();
});

// When page loads, draw all saved cards
cards.forEach(renderCard);