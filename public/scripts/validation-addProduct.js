class FormValidator {
    constructor() {
      this.errorMessages = new Map();
      this.formElement = null;
    }
  
    validateField(input) {
      const value = input.value.trim();
      let isValid = true;
      let message = '';
  
      switch(input.name) {
        case 'title':
          if (!value) {
            isValid = false;
            message = 'Product title is required';
          } else if (value.length < 3) {
            isValid = false;
            message = 'Title must be at least 3 characters long';
          }
          break;
  
        case 'titleDescription':
          if (!value) {
            isValid = false;
            message = 'Title description is required';
          }
          break;
  
        case 'productDescription':
          if (!value) {
            isValid = false;
            message = 'Product description is required';
          }
          break;
  
        case 'highlights':
          if (!value) {
            isValid = false;
            message = 'Highlights are required';
          }
          break;
  
        case 'details':
          if (!value) {
            isValid = false;
            message = 'Details are required';
          }
          break;
  
        case 'size[]':
          if (!value) {
            isValid = false;
            message = 'Size is required';
          }
          break;
  
        case 'quantity[]':
          if (!value || isNaN(value) || parseInt(value) < 0) {
            isValid = false;
            message = 'Please enter a valid quantity';
          }
          break;
  
        case 'price[]':
          if (!value || isNaN(value) || parseFloat(value) <= 0) {
            isValid = false;
            message = 'Please enter a valid price';
          }
          break;
  
        case 'discountedPrice[]':
          const originalPrice = input.parentElement.parentElement.querySelector('input[name="price[]"]').value;
          if (!value || isNaN(value) || parseFloat(value) < 0) {
            isValid = false;
            message = 'Please enter a valid discounted price';
          } else if (parseFloat(value) >= parseFloat(originalPrice)) {
            isValid = false;
            message = 'Discounted price must be less than original price';
          }
          break;
  
        case 'discountedPercentage[]':
          if (!value || isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100) {
            isValid = false;
            message = 'Please enter a valid discount percentage (0-100)';
          }
          break;
      }
  
      if (!isValid) {
        this.showError(input.id || input.name, message);
        input.classList.add('border-red-500');
      } else {
        this.hideError(input.id || input.name);
        input.classList.remove('border-red-500');
      }
  
      return isValid;
    }
  
    validateAllFields() {
      let isValid = true;
  
      // Validate all text inputs and textareas
      const inputs = this.formElement.querySelectorAll('input[type="text"], textarea');
      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });
  
      // Validate size table
      const sizeTable = document.getElementById('productTable');
      const rows = sizeTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
      
      if (rows.length === 0) {
        this.showFormError('Please add at least one size variant');
        isValid = false;
      } else {
        for (let row of rows) {
          const inputs = row.getElementsByTagName('input');
          for (let input of inputs) {
            if (!this.validateField(input)) {
              isValid = false;
            }
          }
        }
      }
  
      // Validate images
      if (croppedImagesData.length === 0) {
        this.showError('productImages', 'Please add at least one product image');
        isValid = false;
      }
  
      return isValid;
    }
  
    init(formId) {
      this.formElement = document.getElementById(formId);
      if (!this.formElement) {
        console.error(`Form with ID '${formId}' not found`);
        return;
      }
  
      // Add form submit event listener
      this.formElement.addEventListener('submit', (e) => {
        e.preventDefault();
  
        // Validate all fields
        const isValid = this.validateAllFields();
  
        if (isValid) {
          // Create FormData and proceed with fetch
          const formData = new FormData(this.formElement);
          formData.delete('productImages');
          croppedImagesData.forEach((blob, index) => {
            formData.append(`productImages`, blob, `cropped_${index}.png`);
          });
  
          fetch(this.formElement.action, {
            method: 'POST',
            body: formData,
          })
          .then(response => response.json())
          .then(data => {
            if (data.message) {
              alert(data.message);
              location.reload();
            } else {
              alert('Failed to add product: ' + data.error);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('Failed to add product');
          });
        } else {
          this.showFormError('Please correct all errors before submitting');
          // Scroll to the first error
          const firstError = document.querySelector('.error-message[style*="block"]');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
  
      // Add validation on input change
      this.formElement.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          this.validateField(e.target);
        }
      });
    }
  
    showError(inputId, message) {
      let errorDiv = document.getElementById(`error-${inputId}`);
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = `error-${inputId}`;
        errorDiv.className = "error-message text-red-900 bg-red-100 border-l-4 border-red-500 text-md mt-1 p-3 rounded";
        const input = document.getElementById(inputId) || document.querySelector(`[name="${inputId}"]`);
        if (input) {
          input.parentElement.appendChild(errorDiv);
        }
      }
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      this.errorMessages.set(inputId, message);
    }
  
    hideError(inputId) {
      const errorDiv = document.getElementById(`error-${inputId}`);
      if (errorDiv) {
        errorDiv.style.display = 'none';
        this.errorMessages.delete(inputId);
      }
    }
  
    showFormError(message) {
      let errorContainer = this.formElement.querySelector('.form-error-container');
      if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'form-error-container bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
        this.formElement.insertBefore(errorContainer, this.formElement.firstChild);
      }
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
    }
  
    hideFormError() {
      const errorContainer = this.formElement.querySelector('.form-error-container');
      if (errorContainer) {
        errorContainer.style.display = 'none';
      }
    }
  }