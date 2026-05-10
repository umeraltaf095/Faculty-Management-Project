function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
        
        const style = document.createElement('style');
        style.innerHTML = `
            #toast-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .toast {
                padding: 12px 20px;
                border-radius: 4px;
                color: #fff;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s, transform 0.3s;
                min-width: 250px;
                text-align: left;
            }
            .toast.show {
                opacity: 1;
                transform: translateY(0);
            }
            .toast.success {
                background-color: #28a745;
            }
            .toast.error {
                background-color: #dc3545;
            }
            .toast.info {
                background-color: #17a2b8;
            }
        `;
        document.head.appendChild(style);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

window.showToast = showToast;
