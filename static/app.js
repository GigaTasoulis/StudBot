class Chatbox {
    constructor() {
        this.args = {
            openbutton: document.querySelector('.chatbox__button'),
            chatbox: document.querySelector('.chatbox__support'),
            sendbutton: document.querySelector('.send__button')
        }
        
        this.state = false;
        this.messages = [];
        this.previousOptions = [];
        this.roleButtons = []; // Array to store dynamically created role buttons
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

        // Dynamically create and append the STUDENT and PARENT buttons
        const studentButton = this.createRoleButton("ΦΟΙΤΗΤΗΣ");
        const parentButton = this.createRoleButton("ΓΟΝΕΑΣ");
        this.roleButtons.push(studentButton, parentButton);
        chatbox.querySelector('.chatbox__messages').appendChild(studentButton);
        chatbox.querySelector('.chatbox__messages').appendChild(parentButton);
    }

    createRoleButton(role) {
        const button = document.createElement('button');
        button.classList.add('role-button');
        button.dataset.role = role;
        button.textContent = role;
        button.addEventListener('click', () => {
            const selectedRole = button.dataset.role;
            this.handleRoleSelection(selectedRole);
        });
        return button;
    }

    toggleState(chatbox) {
        this.state = !this.state;

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
            if (item.name === "StudBot") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }

    handleRoleSelection(selectedRole) {
        if (selectedRole === 'ΦΟΙΤΗΤΗΣ') {
            const studentOptions = [
                'ΤΟ ΤΜΗΜΑ', 
                'ΕΚΠΑΙΔΕΥΣΗ', 
                'ΠΟΙΟΤΗΤΑ', 
                'ΕΡΕΥΝΑ', 
                'ΠΡΟΣΩΠΙΚΟ', 
                'ΑΝΑΚΟΙΝΩΣΕΙΣ',
                'ΠΡΟΓΡΑΜΜΑ ΜΑΘΗΜΑΤΩΝ'
            ];
            this.displayOptions(selectedRole, studentOptions);
        } else if (selectedRole === 'ΓΟΝΕΑΣ') {
            const parentOptions = [
                'ΕΠΙΚΟΙΝΩΝΙΑ ΜΕ ΚΑΘΗΓΗΤΕΣ', 
                'ΓΙΑ ΤΟ ΤΜΗΜΑ'
            ];
            this.displayOptions(selectedRole, parentOptions);
        }
    }

    displayOptions(selectedRole, options) {
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.innerHTML = ''; // Clear previous messages
    
        const backButton = document.createElement('button');
        backButton.classList.add('back-button');
        backButton.innerHTML = '<img src="static/icon/arrow-icon.png" alt="Back">';
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
                this.previousOptions.push(selectedOption);
                this.handleOptionSelection(selectedOption);
            });
            chatboxMessages.appendChild(optionButton);
        });
    }

    handleOptionSelection(selectedOption) {
        console.log('Selected Option:', selectedOption);
        switch(selectedOption) {
            case 'ΤΟ ΤΜΗΜΑ':
                window.location.href = 'https://www.ece.upatras.gr/index.php/el/hm-ty.html';
                break;
            case 'ΕΚΠΑΙΔΕΥΣΗ':
                window.location.href = 'https://www.ece.upatras.gr/index.php/el/mm-education.html';
                break;
            case 'ΠΡΟΓΡΑΜΜΑ ΜΑΘΗΜΑΤΩΝ': // TODO fix the fetcing.
                const pdfUrl = 'https://www.ece.upatras.gr/images/Attachments/%CE%A0%CF%81%CF%8C%CE%B3%CF%81%CE%B1%CE%BC%CE%BC%CE%B1_%CE%9C%CE%B1%CE%B8%CE%B7%CE%BC%CE%AC%CF%84%CF%89%CE%BD-%CE%95%CE%BE%CE%B5%CF%84%CE%AC%CF%83%CE%B5%CF%89%CE%BD/earino202324v1.pdf';
        fetch(pdfUrl)
            .then(response => response.blob())
            .then(blob => {
                // Create a URL for the PDF blob
                const pdfUrl = URL.createObjectURL(blob);
                // Display the PDF link in the chatbox
                const pdfLink = document.createElement('a');
                pdfLink.href = pdfUrl;
                pdfLink.textContent = 'Πρόγραμμα Μαθημάτων';
                pdfLink.target = '_blank'; // Open in a new tab
                const chatboxMessages = document.querySelector('.chatbox__messages');
                chatboxMessages.appendChild(pdfLink);
            })
            .catch(error => {
                console.error('Error fetching PDF:', error);
            });
            default:
                break;
        }
    }

    goBack() {
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.innerHTML = ``;
        this.roleButtons.forEach(button => {
            const role = button.dataset.role;
            if (role === 'ΦΟΙΤΗΤΗΣ' || role === 'ΓΟΝΕΑΣ') {
                chatboxMessages.appendChild(button);
            }
        });
    }
}

const chatbox = new Chatbox();
chatbox.display();
