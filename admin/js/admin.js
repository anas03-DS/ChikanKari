document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const adminSidebar = document.querySelector('.admin-sidebar');
    
    if (toggleSidebarBtn && adminSidebar) {
        toggleSidebarBtn.addEventListener('click', function() {
            adminSidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.admin-sidebar') && 
                !event.target.closest('#toggle-sidebar') && 
                adminSidebar.classList.contains('active')) {
                adminSidebar.classList.remove('active');
            }
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                // Clear any auth tokens or session data
                localStorage.removeItem('admin_token');
                // Redirect to login page
                window.location.href = 'index.html';
            }
        });
    }
    
    // Admin login form
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.querySelector('input[name="remember"]').checked;
            
            // In a real application, you would send this data to a server
            // For demo purposes, we'll just check for a hardcoded admin account
            if (email === 'admin@example.com' && password === 'admin123') {
                // Store token (in a real app, this would come from the server)
                const demoToken = 'demo_admin_token_' + Date.now();
                localStorage.setItem('admin_token', demoToken);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid email or password. Please try again.');
            }
        });
    }
    
    // Product modal functionality
    const addProductBtn = document.getElementById('add-product-btn');
    const addProductModal = document.getElementById('add-product-modal');
    const modalClose = document.querySelector('.modal-close');
    const cancelBtn = document.querySelector('.cancel-btn');
    
    if (addProductBtn && addProductModal) {
        addProductBtn.addEventListener('click', function() {
            addProductModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
        
        function closeModal() {
            addProductModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === addProductModal) {
                closeModal();
            }
        });
    }
    
    // File upload preview
    const productImage = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    
    if (productImage && imagePreview) {
        productImage.addEventListener('change', function() {
            imagePreview.innerHTML = '';
            
            if (this.files) {
                for (let i = 0; i < this.files.length; i++) {
                    const file = this.files[i];
                    if (!file.type.match('image.*')) continue;
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.width = '80px';
                        img.style.height = '80px';
                        img.style.objectFit = 'cover';
                        img.style.borderRadius = '5px';
                        imagePreview.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }
    
    // Select all checkbox functionality
    const selectAll = document.getElementById('select-all');
    const productCheckboxes = document.querySelectorAll('.product-checkbox');
    
    if (selectAll && productCheckboxes.length > 0) {
        selectAll.addEventListener('change', function() {
            productCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
        
        productCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const allChecked = Array.from(productCheckboxes).every(c => c.checked);
                const someChecked = Array.from(productCheckboxes).some(c => c.checked);
                
                selectAll.checked = allChecked;
                selectAll.indeterminate = someChecked && !allChecked;
            });
        });
    }
    
    // Add product form submission
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, you would send this data to a server
            // For demo purposes, we'll just show an alert
            alert('Product added successfully!');
            closeModal();
        });
    }
    
    // Action buttons functionality
    const viewButtons = document.querySelectorAll('.view-btn');
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    if (viewButtons.length > 0) {
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const productName = row.querySelector('td:nth-child(3)').textContent;
                alert(`Viewing details for ${productName}`);
            });
        });
    }
    
    if (editButtons.length > 0) {
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const productName = row.querySelector('td:nth-child(3)').textContent;
                alert(`Editing ${productName}`);
            });
        });
    }
    
    if (deleteButtons.length > 0) {
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const productName = row.querySelector('td:nth-child(3)').textContent;
                
                if (confirm(`Are you sure you want to delete ${productName}?`)) {
                    // In a real application, you would send a delete request to the server
                    // For demo purposes, we'll just remove the row from the table
                    row.remove();
                }
            });
        });
    }
}); 