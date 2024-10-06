//exit button
export function exitButton() {
    const exitButton = document.createElement("button");
    exitButton.innerHTML = "Exit";
    exitButton.classList.add("exitButton");
    exitButton.addEventListener("click", () => {
        window.location.reload();
    });
    return exitButton;
}