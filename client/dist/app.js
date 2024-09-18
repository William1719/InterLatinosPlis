// Render the button component
paypal
    .Buttons({
        // Sets up the transaction when a payment button is clicked
        createOrder: createOrderCallback,
        onApprove: onApproveCallback,
        onError: function (error) {
            // Do something with the error from the SDK
        },

        style: {
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
        },
        message: {
            amount: 100,
        } ,
    })
    .render("#paypal-button-container"); 

// Render each field after checking for eligibility
const cardField = window.paypal.CardFields({
    createOrder: createOrderCallback,
    onApprove: onApproveCallback,
    style: {
        input: {
            "font-size": "16px",
            "font-family": "courier, monospace",
            "font-weight": "lighter",
            color: "#ccc",
        },
        ".invalid": { color: "purple" },
    },
});

if (cardField.isEligible()) {
    const nameField = cardField.NameField({
        style: { input: { color: "blue" }, ".invalid": { color: "purple" } },
    });
    nameField.render("#card-name-field-container");

    const numberField = cardField.NumberField({
        style: { input: { color: "blue" } },
    });
    numberField.render("#card-number-field-container");

    const cvvField = cardField.CVVField({
        style: { input: { color: "blue" } },
    });
    cvvField.render("#card-cvv-field-container");

    const expiryField = cardField.ExpiryField({
        style: { input: { color: "blue" } },
    });
    expiryField.render("#card-expiry-field-container");

    // Add click listener to submit button and call the submit function on the CardField component
    document
        .getElementById("card-field-submit-button")
        .addEventListener("click", () => {
            cardField
                .submit({
                    // From your billing address fields
                    billingAddress: {
                        addressLine1: document.getElementById(
                            "card-billing-address-line-1"
                        ).value,
                        addressLine2: document.getElementById(
                            "card-billing-address-line-2"
                        ).value,
                        adminArea1: document.getElementById(
                            "card-billing-address-admin-area-line-1"
                        ).value,
                        adminArea2: document.getElementById(
                            "card-billing-address-admin-area-line-2"
                        ).value,
                        countryCode: document.getElementById(
                            "card-billing-address-country-code"
                        ).value,
                        postalCode: document.getElementById(
                            "card-billing-address-postal-code"
                        ).value,
                    },
                    
                })
                .then(() => {
                    // submit successful
                });
        });
}


async function createOrderCallback() {
    resultMessage("");
    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // use the "body" param to optionally pass additional order information
            // like product ids and quantities
            body: JSON.stringify({
                cart: [
                    {
                        id: "YOUR_PRODUCT_ID",
                        quantity: "YOUR_PRODUCT_QUANTITY",
                    },
                ],
            }),
        });

        const orderData = await response.json();

        if (orderData.id) {
            return orderData.id;
        } else {
            const errorDetail = orderData?.details?.[0];
            const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);

            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error(error);
        resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
    }
}

async function onApproveCallback(data, actions) {
    try {
        const response = await fetch(`/api/orders/${data.orderID}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const orderData = await response.json();
        // Three cases to handle:
        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        //   (2) Other non-recoverable errors -> Show a failure message
        //   (3) Successful transaction -> Show confirmation or thank you message

        const transaction =
            orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
            orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
        const errorDetail = orderData?.details?.[0];

        if (errorDetail || !transaction || transaction.status === "DECLINED") {
            // (2) Other non-recoverable errors -> Show a failure message
            let errorMessage;
            if (transaction) {
                errorMessage = `Transaction ${transaction.status}: ${transaction.id}`;
            } else if (errorDetail) {
                errorMessage = `${errorDetail.description} (${orderData.debug_id})`;
            } else {
                errorMessage = JSON.stringify(orderData);
            }

            throw new Error(errorMessage);
        } else {
            // (3) Successful transaction -> Show confirmation or thank you message
            // Or go to another URL:  actions.redirect('thank_you.html');
            resultMessage(
                `Transaction ${transaction.status}: ${transaction.id}<br><br>See console for all available details`
            );
            console.log(
                "Capture result",
                orderData,
                JSON.stringify(orderData, null, 2)
            );
        }
    } catch (error) {
        console.error(error);
        resultMessage(
            `Sorry, your transaction could not be processed...<br><br>${error}`
        );
    }
}

// Example function to show a result to the user. Your site's UI library can be used instead.
function resultMessage(message) {
    const container = document.querySelector("#result-message");
    container.innerHTML = message;
}
