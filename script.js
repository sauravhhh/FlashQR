// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const qrType = document.getElementById('qr-type');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const filenameInput = document.getElementById('filename');
    const qrContainer = document.getElementById('qr-container');
    const qrcode = document.getElementById('qrcode');
    const notification = document.getElementById('notification');

    // Dynamic fields
    const dynamicFields = document.querySelectorAll('.dynamic-fields');
    
    // Download counter
    let downloadCount = 0;

    // Show notification
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Toggle dynamic fields based on QR type
    qrType.addEventListener('change', function() {
        const selectedType = this.value;
        
        // Hide all dynamic fields
        dynamicFields.forEach(field => {
            field.classList.remove('active');
        });
        
        // Show selected field
        document.getElementById(`${selectedType}-fields`).classList.add('active');
    });

    // Generate QR code using API
    generateBtn.addEventListener('click', function() {
        const selectedType = qrType.value;
        let qrData = '';
        
        switch(selectedType) {
            case 'url':
                const url = document.getElementById('url').value.trim();
                if (!url) {
                    showNotification('Please enter a URL');
                    return;
                }
                qrData = url;
                break;
                
            case 'text':
                const text = document.getElementById('text').value.trim();
                if (!text) {
                    showNotification('Please enter some text');
                    return;
                }
                qrData = text;
                break;
                
            case 'contact':
                const name = document.getElementById('contact-name').value.trim();
                const phone = document.getElementById('contact-phone').value.trim();
                const email = document.getElementById('contact-email').value.trim();
                const house = document.getElementById('contact-house').value.trim();
                const village = document.getElementById('contact-village').value.trim();
                const district = document.getElementById('contact-district').value.trim();
                const state = document.getElementById('contact-state').value.trim();
                const pin = document.getElementById('contact-pin').value.trim();
                
                if (!name) {
                    showNotification('Please enter a name');
                    return;
                }
                
                // Build address string
                let addressParts = [];
                if (house) addressParts.push(house);
                if (village) addressParts.push(village);
                if (district) addressParts.push(district);
                if (state) addressParts.push(state);
                if (pin) addressParts.push(pin);
                
                const fullAddress = addressParts.join(', ');
                
                qrData = `BEGIN:VCARD\nVERSION:3.0\nN:${name};;;\nFN:${name}\n`;
                if (phone) qrData += `TEL:${phone}\n`;
                if (email) qrData += `EMAIL:${email}\n`;
                if (fullAddress) qrData += `ADR:${fullAddress}\n`;
                qrData += `END:VCARD`;
                break;
                
            case 'email':
                const emailAddress = document.getElementById('email-address').value.trim();
                const subject = document.getElementById('email-subject').value.trim();
                const body = document.getElementById('email-body').value.trim();
                
                if (!emailAddress) {
                    showNotification('Please enter an email address');
                    return;
                }
                
                qrData = `mailto:${emailAddress}`;
                if (subject || body) {
                    qrData += '?';
                    if (subject) qrData += `subject=${encodeURIComponent(subject)}`;
                    if (subject && body) qrData += '&';
                    if (body) qrData += `body=${encodeURIComponent(body)}`;
                }
                break;
                
            case 'quickcall':
                const quickcallNumber = document.getElementById('quickcall-number').value.trim();
                if (!quickcallNumber) {
                    showNotification('Please enter a phone number');
                    return;
                }
                // Format as tel:9876543210 (remove any spaces or special characters except +)
                const cleanNumber = quickcallNumber.replace(/[^\d+]/g, '');
                qrData = `tel:${cleanNumber}`;
                break;
                
            case 'sms':
                const smsNumber = document.getElementById('sms-number').value.trim();
                const smsMessage = document.getElementById('sms-message').value.trim();
                
                if (!smsNumber) {
                    showNotification('Please enter a phone number');
                    return;
                }
                
                qrData = `sms:${smsNumber}`;
                if (smsMessage) {
                    qrData += `?body=${encodeURIComponent(smsMessage)}`;
                }
                break;
                
            case 'wifi':
                const ssid = document.getElementById('wifi-ssid').value.trim();
                const password = document.getElementById('wifi-password').value.trim();
                const wifiType = document.getElementById('wifi-type').value;
                
                if (!ssid) {
                    showNotification('Please enter a network name');
                    return;
                }
                
                qrData = `WIFI:T:${wifiType};S:${ssid};`;
                if (password) {
                    qrData += `P:${password};`;
                }
                qrData += ';';
                break;
                
            case 'upi':
                const upiId = document.getElementById('upi-id').value.trim();
                const upiName = document.getElementById('upi-name').value.trim();
                const upiAmount = document.getElementById('upi-amount').value.trim();
                const upiNote = document.getElementById('upi-note').value.trim();
                
                if (!upiId) {
                    showNotification('Please enter a UPI ID');
                    return;
                }
                
                // Using the exact format: upi://pay?pa=example@upi&pn=Example%20Name&am=10&cu=INR
                qrData = `upi://pay?pa=${upiId}`;
                if (upiName) qrData += `&pn=${encodeURIComponent(upiName)}`;
                if (upiAmount) qrData += `&am=${upiAmount}`;
                // Always include currency as INR
                qrData += `&cu=INR`;
                if (upiNote) qrData += `&tn=${encodeURIComponent(upiNote)}`;
                break;
        }
        
        // Clear previous QR code
        qrcode.innerHTML = '';
        
        // Show loading state
        generateBtn.innerHTML = '<span class="loading"></span>Generating...';
        generateBtn.disabled = true;
        
        // Generate new QR code using the specified API
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;
        
        const img = new Image();
        img.onload = function() {
            qrcode.appendChild(img);
            qrContainer.classList.add('active');
            showNotification('QR code generated successfully!');
            generateBtn.innerHTML = 'Generate QR Code';
            generateBtn.disabled = false;
        };
        
        img.onerror = function() {
            showNotification('Error generating QR code');
            generateBtn.innerHTML = 'Generate QR Code';
            generateBtn.disabled = false;
        };
        
        img.src = apiUrl;
    });

    // Download QR code
    downloadBtn.addEventListener('click', function() {
        const img = qrcode.querySelector('img');
        if (!img) {
            showNotification('No QR code to download');
            return;
        }
        
        // Get custom filename or use default
        let fileName = filenameInput.value.trim();
        if (!fileName) {
            // Use default naming
            fileName = 'flashqr';
            if (downloadCount > 0) {
                fileName += downloadCount;
            }
            downloadCount++;
        }
        
        // Ensure filename has .png extension
        if (!fileName.toLowerCase().endsWith('.png')) {
            fileName += '.png';
        }
        
        // Use fetch to get the image as a blob
        fetch(img.src)
            .then(response => response.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                showNotification('QR code downloaded');
            })
            .catch(error => {
                console.error('Download error:', error);
                showNotification('Error downloading QR code');
            });
    });
});
