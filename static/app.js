class Chatbox {
    constructor() {
        this.args = {
            openbutton: document.querySelector('.chatbox__button'),
            chatbox: document.querySelector('.chatbox__support'),
            sendbutton: document.querySelector('.send__button')
        }
        
        this.state = false;
        this.messages = [];
        this.previousOptions = []; // Define previousOptions array
    }

    display() {
        const { openbutton, chatbox, sendbutton } = this.args;

        openbutton.addEventListener('click', () => this.toggleState(chatbox))

        sendbutton.addEventListener('click', () => this.onSendButton(chatbox))

        const node = chatbox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatbox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if (this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "StudBot", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "StudBot")
            {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else
            {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }

    displayOptions(selectedRole, options) {
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.innerHTML = ''; // Clear previous messages
    
        // Add back button if there are previous options
        const backButton = document.createElement('button');
        backButton.classList.add('back-button');
        backButton.textContent = 'Back';
    
        backButton.addEventListener('click', () => {
            this.goBack();
        });
    
        chatboxMessages.appendChild(backButton);
    
        options.forEach(option => {
            const optionButton = document.createElement('button');
            optionButton.classList.add('option-button');
            optionButton.textContent = option;
            optionButton.addEventListener('click', () => {
                const selectedOption = optionButton.textContent;
                // Handle selected option
                this.previousOptions.push(selectedOption);
                this.handleOptionSelection(selectedOption);
            });
            chatboxMessages.appendChild(optionButton);
        });
    }

    handleOptionSelection(selectedOption) {
        // Your code to handle selected option
        console.log('Selected Option:', selectedOption);
    }

    goBack() {
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.innerHTML = `
            <div>Τι είστε;</div>
            <button class="role-button" data-role="STUDENT">ΦΟΙΤΗΤΗΣ</button>
            <button class="role-button" data-role="PARENT">ΓΟΝΕΑΣ</button>
        `;
    }
    
    
    
}

const roleButtons = document.querySelectorAll('.role-button');
const chatbox = new Chatbox();
chatbox.display();

roleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectedRole = button.dataset.role;
        // Example of displaying subsequent options based on selected role
        if (selectedRole === 'STUDENT') {
            const studentOptions = [
                'ΤΟ ΤΜΗΜΑ', 
                'ΕΚΠΑΙΔΕΥΣΗ', 
                'ΠΟΙΟΤΗΤΑ', 
                'ΕΡΕΥΝΑ', 
                'ΠΡΟΣΩΠΙΚΟ', 
                'ΑΝΑΚΟΙΝΩΣΕΙΣ'
            ];
            chatbox.displayOptions(selectedRole, studentOptions);
        } else if (selectedRole === 'PARENT') {

            // Display parent options
            const parentOptions = [
                'ΕΠΙΚΟΙΝΩΝΙΑ ΜΕ ΚΑΘΗΓΗΤΕΣ', 
                'ΓΙΑ ΤΟ ΤΜΗΜΑ'
            ]; // Add more parent options if needed

            chatbox.displayOptions(selectedRole, parentOptions);
        }
    });
});
