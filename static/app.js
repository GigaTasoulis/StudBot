class Chatbox {
    constructor() {
        this.args = {
            openbutton: document.querySelector('.chatbox__button'),
            chatbox: document.querySelector('.chatbox__support'),
            sendbutton: document.querySelector('.send__button')
        }

        this.previousOptions = [];
        this.state = false;
        this.messages = [];
        this.firstTimeOpened = true;

        this.minimizeButton = document.querySelector('.minimize-button');
        this.closeButton = document.querySelector('.close-button');

        this.minimizeButton.addEventListener('click', () => this.toggleState(this.args.chatbox));
        this.closeButton.addEventListener('click', () => this.closeChatbox(this.args.chatbox));

        this.sessionTimeout = null;
        this.sessionDuration = 600000; 
        this.startSessionTimer();
    }


    // SESSIONS
    startSessionTimer() {
        this.sessionTimer = setTimeout(() => {
            this.handleSessionExpired();
        }, this.sessionDuration);
    }
    resetSessionTimer() {
        clearTimeout(this.sessionTimer);
        this.startSessionTimer();
    }
    handleSessionExpired() {
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.innerHTML = '<div class="chatbox__message">Your session has expired. Please start over.</div>';
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.classList.add('reset-button');
        resetButton.addEventListener('click', () => {
            this.resetSession();
        });
        chatboxMessages.appendChild(resetButton);
        this.previousOptions = [];
    }

    resetSession() {
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.innerHTML = ``;
        this.previousOptions = [];
        this.display();
        this.resetSessionTimer(); // Reset session timer after reset
    }

    displayWelcomeMessage(chatbox) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.classList.add('welcome-message');
        welcomeMessage.innerHTML = `
            <p>Καλώς ήρθες στο Chat του Πανεπιστημίου. Ξεκίνα τη συνομιλία σου και βρες την απάντηση που χρειάζεσαι για κάθε σου ερώτημα.</p>
            <button class="new-conversation-button">Νέα Συνομιλία</button>
        `;
        chatbox.querySelector('.chatbox__messages').appendChild(welcomeMessage);

        // Add event listener to the "Νέα Συνομιλία" button
        const newConversationButton = welcomeMessage.querySelector('.new-conversation-button');
        newConversationButton.addEventListener('click', () => {
            this.resetSession();
        });
    }
    closeChatbox(chatbox) {
        // Create a confirmation message
        const confirmationMessage = document.createElement('div');
        confirmationMessage.classList.add('confirmation-message');
        confirmationMessage.innerHTML = `
            <p>Είστε σίγουροι ότι θέλετε να τερματίσετε αυτή τη συζήτηση;</p>
            <button class="confirm-button">Ναι</button>
            <button class="cancel-button">Όχι</button>
        `;
        chatbox.querySelector('.chatbox__messages').appendChild(confirmationMessage);
    
        // Add event listeners to the buttons
        const confirmButton = confirmationMessage.querySelector('.confirm-button');
        const cancelButton = confirmationMessage.querySelector('.cancel-button');
    
        confirmButton.addEventListener('click', () => {
            this.closeSession(chatbox);
        });
    
        cancelButton.addEventListener('click', () => {
            confirmationMessage.remove(); // Remove the confirmation message
        });
    }
    
    closeSession(chatbox) {
        // Close the chatbox and reset the session
        this.firstTimeOpened = true;
        this.resetSession();
        chatbox.classList.remove('chatbox--active');
        
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
        if (!this.firstTimeOpened) {
            const studentButton = this.createRoleButton("ΦΟΙΤΗΤΗΣ");
            const parentButton = this.createRoleButton("ΓΟΝΕΑΣ");
            chatbox.querySelector('.chatbox__messages').appendChild(studentButton);
            chatbox.querySelector('.chatbox__messages').appendChild(parentButton);
        } else {
            this.displayWelcomeMessage(this.args.chatbox);
            this.firstTimeOpened = false;
            
        }
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

        if (this.sendingMessage) {
            return;
        }
        this.sendingMessage = true;
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            this.sendingMessage = false;
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
          }).finally(() => {
            // Reset the flag after the message is sent
            this.sendingMessage = false;
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
    
    displayOptions(selectedOption,options) {
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.innerHTML = ''; // Clear previous messages
        this.previousOptions.push(options);
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
                this.handleOptionSelection(selectedOption);
            });
            chatboxMessages.appendChild(optionButton);
        });
    }
    //STUDENT OR PARENT
    handleRoleSelection(selectedRole) {
        // Display the options based on the selected role
        switch(selectedRole) {
            case 'ΦΟΙΤΗΤΗΣ':
                console.log("Student role selected.");
                this.handleStudentOptions();
                break;
            case 'ΓΟΝΕΑΣ':
                console.log("Parent role selected.");
                this.handleParentOptions();
                break;
            default:
                break;
        }
    }

    // FOR THE STUDENT OPTION
    handleStudentOptions() {
        console.log("Handling student options...");
        const studentOptions = [
            'ΤΟ ΤΜΗΜΑ', 
            'ΕΚΠΑΙΔΕΥΣΗ', 
            'ΠΟΙΟΤΗΤΑ', 
            'ΕΡΕΥΝΑ', 
            'ΠΡΟΣΩΠΙΚΟ', 
            'ΑΝΑΚΟΙΝΩΣΕΙΣ',
            'ΚΥΠΕΣ'
        ];
        this.displayOptions(null, studentOptions);
    }
    // FOR THE PARENT OPTION
    handleParentOptions() {
        console.log("Handling parent options...");
        const parentOptions = [
            'ΤΟ ΤΜΗΜΑ', 
            'ΠΟΙΟΤΗΤΑ', 
            'ΑΝΑΚΟΙΝΩΣΕΙΣ'
        ];
        this.displayOptions(null, parentOptions);
    }

    handleOptionSelection(selectedOption) {
        switch(selectedOption) {
            case 'ΤΟ ΤΜΗΜΑ':
                console.log("Department option selected.");
                this.handleDepartmentOptions();
                break;
            case 'ΕΚΠΑΙΔΕΥΣΗ':
                console.log("Education option selected.");
                this.handleEducationOptions();
                break;
            case 'ΠΟΙΟΤΗΤΑ':
                console.log("Quality option selected.");
                this.handleQualityOptions();
                break;
            case 'ΕΡΕΥΝΑ':
                console.log("Research option selected.");
                this.handleResearchOptions();
                break;
            case 'ΠΡΟΣΩΠΙΚΟ':
                console.log("Staff option selected.");
                this.handleStaffOptions();
                break;
            case 'ΑΝΑΚΟΙΝΩΣΕΙΣ':
                console.log("Announcements option selected.");
                this.handleAnnouncementsOptions();
                break;
            case 'ΠΡΟΓΡΑΜΜΑ ΜΑΘΗΜΑΤΩΝ':
                console.log("Schedule option selected.");
                this.handleScheduleOptions();
                break;
            case 'ΠΡΟΟΔΟΣ':
                console.log("Progress option selected.");
                this.handleProgressOptions();
                break;
            case 'ΚΥΠΕΣ':
                console.log("ΚΥΠΕΣ option selected.");
                this.handleLabOptions();
                break;
            default:
                break;
        }
    }

    handleDepartmentOptions() {
        console.log("Handling department options...");
        const departmentOptions = [
            'Χαιρετισμοί',
            'Ιστορία',
            'Δομή και Όργανα',
            'Γραμματεία',
            'Κανονισμός',
            'Επιτροπές',
            'Υγεία και Ασφάλεια',
            'Εκδηλώσεις Τμήματος',
            'Διαπανεπιστημιακό Κέντρο',
            'Απόφοιτοι',
            'Διεθνής Συμβουλευτική Επιτροπή',
            'Ημερήσιες Διατάξεις'
        ];
        this.displayOptions(null, departmentOptions);
        
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('option-button')) {
                const selectedOption = target.textContent;
                switch(selectedOption) {
                    case 'Χαιρετισμοί':
                        window.open('https://www.ece.upatras.gr/index.php/el/xairetismoi/perimenontas-tous-neous-foitites.html');
                        break;
                    case 'Ιστορία':
                        window.open('https://www.ece.upatras.gr/index.php/el/istoria.html');
                        break;
                    case 'Δομή και Όργανα':
                        window.open('https://www.ece.upatras.gr/index.php/el/domi-kai-organa.html');
                        break;
                    case 'Γραμματεία':
                        window.open('https://www.ece.upatras.gr/index.php/el/secretariat.html');
                        break;
                    case 'Εσωτερικός Κανονισμός του Πανεπιστημίου Πατρών':
                        window.open('https://www.ece.upatras.gr/index.php/el/esoterikos-kanonismos-tou-panepistimiou-patron.html');
                        break;
                    case 'Επιτροπές Τμήματος':
                        window.open('https://www.ece.upatras.gr/index.php/el/epitropes.html');
                        break;
                    case 'Υγεία και Ασφάλεια':
                        window.open('https://www.ece.upatras.gr/index.php/el/health-and-safety.html');
                        break;
                    case 'Εκδηλώσεις Τμήματος':
                        window.open('https://www.ece.upatras.gr/index.php/el/departments-events.html');
                        break;
                    case 'Διαπανεπιστημιακό Κέντρο (Hub) Τεχνητής Νοημοσύνης - Δωρεά Φ. Σωτηρόπουλου':
                        window.open('https://www.ece.upatras.gr/index.php/el/to-diapanepistimiako-kentro-hub-texnitis-noimosynis-dorea-f-sotiropoulou.html');
                        break;
                    case 'Απόφοιτοι':
                        window.open('https://www.ece.upatras.gr/index.php/el/alumni.html');
                        break;
                    case 'Διεθνής Συμβουλευτική Επιτροπή':
                        window.open('https://www.ece.upatras.gr/index.php/el/advisory-board.html');
                        break;
                    case 'Ημερήσιες Διατάξεις':
                        window.open('https://www.ece.upatras.gr/index.php/el/hmerisies.html');
                        break;
                    default:
                        break;
                }
            }
        });
    }
    
    
    
    handleEducationOptions() {
        console.log("Handling education options...");
        const educationOptions = [
            'Οδηγός Σπουδών',
            'Προπτυχιακή Εκπαίδευση',
            'Μεταπτυχιακή Εκπαίδευση',
            'Πρόγραμμα Διδακτορικών Σπουδών',
            'Ακαδημαϊκό Ημερολόγιο',
            'Ωρολόγιο Πρόγραμμα Μαθημάτων-Εξετάσεων',
            'Σύμβουλος Καθηγητής',
            'ΕΡΑΣΜΟΣ+'
        ];
        this.displayOptions(null, educationOptions);
        
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('option-button')) {
                const selectedOption = target.textContent;
                switch(selectedOption) {
                    case 'Οδηγός Σπουδών':
                        window.open('https://www.ece.upatras.gr/index.php/el/curriculum.html');
                        break;
                    case 'Προπτυχιακή Εκπαίδευση':
                        window.open('https://www.ece.upatras.gr/index.php/el/undergraduate.html');
                        break;
                    case 'Μεταπτυχιακή Εκπαίδευση':
                        window.open('https://www.ece.upatras.gr/index.php/el/programmata-metaptyxiakon-spoudwn.html');
                        break;
                    case 'Πρόγραμμα Διδακτορικών Σπουδών':
                        window.open('https://www.ece.upatras.gr/index.php/el/postgraduate-regulations/postgraduate-regulation');
                        break;
                    case 'Ακαδημαϊκό Ημερολόγιο':
                        window.open('https://www.ece.upatras.gr/index.php/el/academic-calendar.html');
                        break;
                    case 'Ωρολόγιο Πρόγραμμα Μαθημάτων-Εξετάσεων':
                        window.open('https://www.ece.upatras.gr/index.php/el/schedule.html');
                        break;
                    case 'Σύμβουλος Καθηγητής':
                        window.open('https://www.ece.upatras.gr/index.php/el/assistant-professor.html');
                        break;
                    case 'ΕΡΑΣΜΟΣ+':
                        window.open('https://www.ece.upatras.gr/index.php/el/erasmos.html');
                        break;
                    default:
                        break;
                }
            }
        });
    }
    
    
    handleLabOptions() {
        console.log("Handling Lab options...");
        const LabOptions = [
            'Χώροι, Προσωπικό, Υπολογιστικοί Πόροι',
            'Υπηρεσίες',
            'Οδηγίες',
            'Πρόγραμμα Αιθουσών',
            'Κανονισμός Λειτουργίας',
            'Αποστολή Αιτημάτων'
        ];
        this.displayOptions(null, LabOptions);
        
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('option-button')) {
                const selectedOption = target.textContent;
                switch(selectedOption) {
                    case 'Χώροι, Προσωπικό, Υπολογιστικοί Πόροι':
                        window.open('https://www.ece.upatras.gr/index.php/el/xoroi-prosopiko-ypologistikoi-poroi-kypes.html');
                        break;
                    case 'Υπηρεσίες':
                        window.open('https://www.ece.upatras.gr/index.php/el/ypiresies-kypes.html');
                        break;
                    case 'Οδηγίες':
                        window.open('https://www.ece.upatras.gr/index.php/el/odigies-kypes.html');
                        break;
                    case 'Πρόγραμμα Αιθουσών':
                        window.open('https://www.ece.upatras.gr/index.php/el/programma-aithouson-kypes.html');
                        break;
                    case 'Κανονισμός Λειτουργίας':
                        window.open('https://www.ece.upatras.gr/index.php/el/kanonismos-leitourgias-kypes.html');
                        break;
                    case 'Αποστολή Αιτημάτων':
                        window.open('https://www.ece.upatras.gr/index.php/el/apostoli-aitimaton-kypes.html');
                        break;
                    default:
                        break;
                }
            }
        });
    }
    

    handleQualityOptions() {
        console.log("Handling quality options...");
        const qualityOptions = [
            'Πολιτική Ποιότητας',
            'Στοχοθεσία Ποιότητας',
            'Εσωτερικές Αξιολογήσεις Τμήματος',
            'Εξωτερικές Αξιολογήσεις Τμήματος',
            'Πιστοποίηση Προπτυχιακού Προγράμματος Σπουδών'
        ];
        this.displayOptions(null, qualityOptions);
        
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('option-button')) {
                const selectedOption = target.textContent;
                switch(selectedOption) {
                    case 'Πολιτική Ποιότητας':
                        window.open('https://www.ece.upatras.gr/index.php/el/quality.html');
                        break;
                    case 'Στοχοθεσία Ποιότητας':
                        window.open('https://www.ece.upatras.gr/index.php/el/objectives.html');
                        break;
                    case 'Εσωτερικές Αξιολογήσεις Τμήματος':
                        window.open('https://www.ece.upatras.gr/index.php/el/int-evaluation-menu.html');
                        break;
                    case 'Εξωτερικές Αξιολογήσεις Τμήματος':
                        window.open('https://www.ece.upatras.gr/index.php/el/ext-evaluation-menu.html');
                        break;
                    case 'Πιστοποίηση Προπτυχιακού Προγράμματος Σπουδών':
                        window.open('https://www.ece.upatras.gr/index.php/el/pistopoiisi-proptyxiakoy-programmatos-spoudon.html');
                        break;
                    default:
                        break;
                }
            }
        });
    }
    
    
    
    handleResearchOptions() {
        console.log("Handling research options...");
        const researchOptions = [
            'Τομείς',
            'Εργαστήρια',
            'Διακρίσεις',
            'Διδακτορικά - Δημοσιεύσεις',
            'Πολιτική Ποιότητας',
            'Στοχοθεσία Ποιότητας',
            'Εσωτερικές Αξιολογήσεις Τμήματος',
            'Εξωτερικές Αξιολογήσεις Τμήματος',
            'Πιστοποίηση Προπτυχιακού Προγράμματος Σπουδών'
        ];
        this.displayOptions(null, researchOptions);
        
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('option-button')) {
                const selectedOption = target.textContent;
                switch(selectedOption) {
                    case 'Τομείς':
                        window.open('https://www.ece.upatras.gr/index.php/el/divisions.html');
                        break;
                    case 'Εργαστήρια':
                        window.open('https://www.ece.upatras.gr/index.php/el/labs.html');
                        break;
                    case 'Διακρίσεις':
                        window.open('https://www.ece.upatras.gr/index.php/el/awards.html');
                        break;
                    case 'Διδακτορικά - Δημοσιεύσεις':
                        window.open('https://www.ece.upatras.gr/index.php/el/didaktorika-dimosieyseis.html');
                        break;
                    case 'Πολιτική Ποιότητας':
                        window.open('https://www.ece.upatras.gr/index.php/el/quality.html');
                        break;
                    case 'Στοχοθεσία Ποιότητας':
                        window.open('https://www.ece.upatras.gr/index.php/el/objectives.html');
                        break;
                    case 'Εσωτερικές Αξιολογήσεις Τμήματος':
                        window.open('https://www.ece.upatras.gr/index.php/el/int-evaluation-menu.html');
                        break;
                    case 'Εξωτερικές Αξιολογήσεις Τμήματος':
                        window.open('https://www.ece.upatras.gr/index.php/el/ext-evaluation-menu.html');
                        break;
                    case 'Πιστοποίηση Προπτυχιακού Προγράμματος Σπουδών':
                        window.open('https://www.ece.upatras.gr/index.php/el/pistopoiisi-proptyxiakoy-programmatos-spoudon.html');
                        break;
                    default:
                        break;
                }
            }
        });
    }
    
    
    
    handleStaffOptions() {
        console.log("Handling staff options...");
        const staffOptions = [
            'Μέλη Διδακτικού Ερευνητικού Προσωπικού (ΔΕΠ)',
            'Μέλη Εργαστηριακού Διδακτικού Προσωπικού (Ε.ΔΙ.Π)',
            'Μέλη Ειδικού Τεχνικού Εργαστηριακού Προσωπικού (Ε.Τ.Ε.Π.)',
            'Διοικητικό Προσωπικό',
            'Ομότιμοι Καθηγητές',
            'Επίτιμοι Καθηγητές και Διδάκτορες',
            'Διατελέσαντες Καθηγητές-Διδάσκοντες'
        ];
        this.displayOptions(null, staffOptions);
        
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('option-button')) {
                const selectedOption = target.textContent;
                switch(selectedOption) {
                    case 'Μέλη Διδακτικού Ερευνητικού Προσωπικού (ΔΕΠ)':
                        window.open('https://www.ece.upatras.gr/index.php/el/faculty.html');
                        break;
                    case 'Μέλη Εργαστηριακού Διδακτικού Προσωπικού (Ε.ΔΙ.Π)':
                        window.open('https://www.ece.upatras.gr/index.php/el/edip.html');
                        break;
                    case 'Μέλη Ειδικού Τεχνικού Εργαστηριακού Προσωπικού (Ε.Τ.Ε.Π.)':
                        window.open('https://www.ece.upatras.gr/index.php/el/etep.html');
                        break;
                    case 'Διοικητικό Προσωπικό':
                        window.open('https://www.ece.upatras.gr/index.php/el/administrative-staff.html');
                        break;
                    case 'Ομότιμοι Καθηγητές':
                        window.open('https://www.ece.upatras.gr/index.php/el/emeriti.html');
                        break;
                    case 'Επίτιμοι Καθηγητές και Διδάκτορες':
                        window.open('https://www.ece.upatras.gr/index.php/el/honoris-causa.html');
                        break;
                    case 'Διατελέσαντες Καθηγητές-Διδάσκοντες':
                        window.open('https://www.ece.upatras.gr/index.php/el/diatelesantes-kathigites-didaskontes.html');
                        break;
                    default:
                        break;
                }
            }
        });
    }
    
    
    
    handleAnnouncementsOptions() {
        console.log("Handling announcements options...");
        const announcementsOptions = [
            'Επείγουσες Ανακοινώσεις',
            'Γενικές Ανακοινώσεις',
            'Εγγραφές, Δηλώσεις Μαθημάτων, Συγγράμματα',
            'Ανακοινώσεις για τους πρωτοετείς φοιτητές',
            'Προπτυχιακές Σπουδές',
            'Μεταπτυχιακές Σπουδές',
            'Διδακτορικές Σπουδές',
            'Παρουσιάσεις Διδακτορικών, Διπλωματικών',
            'Σεμινάρια, Συνέδρια, Μεταπτυχιακά, Υποτροφίες',
            'Ειδήσεις',
            'Νέα',
            'Γεγονότα',
            'Θέσεις Εργασίας για Απόφοιτους Τμήματος',
            'Προκηρύξεις'
        ];
        this.displayOptions(null, announcementsOptions);
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('option-button')) {
                const selectedOption = target.textContent;
                switch(selectedOption) {
                    case 'Επείγουσες Ανακοινώσεις':
                        window.open('https://www.ece.upatras.gr/index.php/el/epeigouses.html');
                        break;
                    case 'Γενικές Ανακοινώσεις':
                        window.open('https://www.ece.upatras.gr/index.php/el/general.html');
                        break;
                    case 'Εγγραφές, Δηλώσεις Μαθημάτων, Συγγράμματα':
                        window.open('https://www.ece.upatras.gr/index.php/el/eggrafes-diloseis-mathimaton-syggrammata.html');
                        break;
                    case 'Ανακοινώσεις για τους πρωτοετείς φοιτητές':
                        window.open('https://www.ece.upatras.gr/index.php/el/announces-a-grade.html');
                        break;
                    case 'Προπτυχιακές Σπουδές':
                        window.open('https://www.ece.upatras.gr/index.php/el/proptixiaka-an.html');
                        break;
                    case 'Μεταπτυχιακές Σπουδές':
                        window.open('https://www.ece.upatras.gr/index.php/el/metaptixiaka-an.html');
                        break;
                    case 'Διδακτορικές Σπουδές':
                        window.open('https://www.ece.upatras.gr/index.php/el/didaktoriko-anak.html');
                        break;
                    case 'Παρουσιάσεις Διδακτορικών, Διπλωματικών':
                        window.open('https://www.ece.upatras.gr/index.php/el/parousiaseis-didaktorikon-diplomatikon.html');
                        break;
                    case 'Σεμινάρια, Συνέδρια, Μεταπτυχιακά, Υποτροφίες':
                        window.open('https://www.ece.upatras.gr/index.php/el/ypotrofies.html');
                        break;
                    case 'Ειδήσεις':
                        window.open('https://www.ece.upatras.gr/index.php/el/news.html');
                        break;
                    case 'Νέα':
                        window.open('https://www.ece.upatras.gr/index.php/el/a-news.html');
                        break;
                    case 'Γεγονότα':
                        window.open('https://www.ece.upatras.gr/index.php/el/gegonota.html');
                        break;
                    case 'Θέσεις Εργασίας για Απόφοιτους Τμήματος':
                        window.open('https://www.ece.upatras.gr/index.php/el/theseis-ergasias-gia-apofoitous-tmimatos.html');
                        break;
                    case 'Προκηρύξεις':
                        window.open('https://www.ece.upatras.gr/index.php/el/prokirikseis-an.html');
                        break;
                    default:
                        break;
                }
            }
        });
    }
    
    
    handleScheduleOptions() {
        console.log("Handling schedule options...");
    }
    
    handleProgressOptions() {
        console.log("Handling progress options...");
        const progressOptions = [
            'Προσπέλαση του Progress',
            'Άλλο'
        ];
        this.displayOptions(null, progressOptions);
    }

    goBack() {     
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.innerHTML = ``;
        const previousSelection = this.previousOptions; // Retrieve previous selection
        
        // Check if previousSelection contains the specific options array
        if (previousSelection.length === 1) {
            this.previousOptions = [];
            this.display(); // If previous selection is empty, go back to the start
        } else {
            // Remove the last two items from previousOptions
            this.previousOptions.pop(); // Remove current selection
            const previousOptions = this.previousOptions.pop(); // Get previous page of options
            this.displayOptions(null, previousOptions);
        }
        
        this.resetSessionTimer(); // Reset session timer on user interaction
    }
    
    
    
}

const chatbox = new Chatbox();
chatbox.display();
