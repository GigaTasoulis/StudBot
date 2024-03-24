class Chatbox {
    constructor() {
        this.args = {
            openbutton: document.querySelector('.chatbox__button'),
            chatbox: document.querySelector('.chatbox__support'),
            sendbutton: document.querySelector('.send__button')
        }
        
        this.state = false;
        this.messages = [];
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
    
    displayOptions(selectedOption,options) {
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
            'Εσωτερικός Κανονισμός του Πανεπιστημίου Πατρών',
            'Επιτροπές Τμήματος',
            'Υγεία και Ασφάλεια',
            'Εκδηλώσεις Τμήματος',
            'Διαπανεπιστημιακό Κέντρο (Hub) Τεχνητής Νοημοσύνης - Δωρεά Φ. Σωτηρόπουλου',
            'Απόφοιτοι',
            'Διεθνής Συμβουλευτική Επιτροπή',
            'Ημερήσιες Διατάξεις'
        ];
        this.displayOptions(null, departmentOptions);
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
    }
    
    handleLabOptions() {
        console.log("Handling Lab options...");
        const LabOptions = [
            'Χώροι, Προσωπικό, Υπολογιστικοί Πόροι',
            'Υπηρεσίες',
            'Οδηγίες',
            'Πρόγραμμα Αιθουσών',
            'Κανονισμός Λειτουργίας',
            'Αποστολή Αιτημάτων',
        ];
        this.displayOptions(null, LabOptions);
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
        console.log("Going back...");
        const chatboxMessages = document.querySelector('.chatbox__messages');
        chatboxMessages.innerHTML = ``;
        this.display();
        
    }
    
    
    
        
}

const chatbox = new Chatbox();
chatbox.display();
