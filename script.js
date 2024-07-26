const SUPABASE_URL = "https://nmpmqxyljrwpqdbfleeb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcG1xeHlsanJ3cHFkYmZsZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEyOTgzNjgsImV4cCI6MjAzNjg3NDM2OH0.l7FaFnKo-5SHNaFKeGs23ViY_-_FqwDlGg8GtuwSGdE";

const database = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", async function () {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const addProductForm = document.getElementById("addProductForm");
  const selectedDateInput = document.getElementById("selectedDate");
  const logoutButton = document.getElementById("logoutButton");

  const signupPage = document.getElementById("signupPage");
  const loginPage = document.getElementById("loginPage");
  const appSection = document.getElementById("appSection");
  const addProductSection = document.getElementById("addProductSection");
  const productListSection = document.getElementById("productListSection");
  const editProductSection = document.getElementById("editProductSection");

  const showSignupPageButton = document.getElementById("showSignupPage");
  const showLoginPageButton = document.getElementById("showLoginPage");
  const showAddProductSectionButton = document.getElementById("showAddProductSection");
  const showProductListSectionButton = document.getElementById("showProductListSection");

  const filterDateInput = document.getElementById("filterDate");

  let currentUserId = localStorage.getItem('userId'); // Charger l'ID de l'utilisateur depuis le localStorage

  if (currentUserId) {
    signupPage.style.display = "none";
    loginPage.style.display = "none";
    appSection.style.display = "block";
    await fetchAndDisplayProducts(); // Passer l'ID de l'utilisateur à fetchAndDisplayProducts
  } else {
    signupPage.style.display = "block";
    loginPage.style.display = "none";
    appSection.style.display = "none";
  }

  showSignupPageButton.addEventListener("click", function () {
    signupPage.style.display = "block";
    loginPage.style.display = "none";
  });

  showLoginPageButton.addEventListener("click", function () {
    signupPage.style.display = "none";
    loginPage.style.display = "block";
  });

  showAddProductSectionButton.addEventListener("click", function () {
    addProductSection.style.display = "block";
    productListSection.style.display = "none";
  });

  showProductListSectionButton.addEventListener("click", async function () {
    addProductSection.style.display = "none";
    productListSection.style.display = "block";
    await fetchAndDisplayProducts(); // Rafraîchir la liste des produits
  });

  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Les mots de passe ne correspondent pas.",
        customClass: {
          confirmButton: 'btn-custom-error'
        }
      });
      return;
    }

    const { data: user, error } = await database.auth.signUp({
      email,
      password,
    });

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur d\'inscription',
        text: error.message,
        customClass: {
          confirmButton: 'btn-custom-error'
        }
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Inscription réussie!',
      customClass: {
        confirmButton: 'btn-custom-success'
      }
    });
    signupPage.style.display = "none";
    loginPage.style.display = "block";
  });

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { data: { user }, error } = await database.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de connexion',
        text: error.message,
        customClass: {
          confirmButton: 'btn-custom-error'
        }
      });
      return;
    }

    Swal.fire({
      title: 'Connexion réussie!',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'btn-custom-success'
      }
    });

    if (user) {
      currentUserId = user.id; // Stockage de l'ID de l'utilisateur connecté
      localStorage.setItem('userId', currentUserId);
      localStorage.setItem('userEmail', email); // Vous pouvez également stocker d'autres informations

      signupPage.style.display = "none";
      loginPage.style.display = "none";
      appSection.style.display = "block";
      await fetchAndDisplayProducts(); // Passer l'ID de l'utilisateur à fetchAndDisplayProducts
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Objet utilisateur manquant ou mal formé.',
        customClass: {
          confirmButton: 'btn-custom-error'
        }
      });
    }
  });

  logoutButton.addEventListener("click", async function () {
    await database.auth.signOut();

    // Effacer les informations de session du localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');

    currentUserId = null; // Réinitialisation de l'ID utilisateur
    appSection.style.display = "none";
    signupPage.style.display = "block";
  });

  addProductForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const productQuantity = document.getElementById("productQuantity").value;
    const selectedDate = selectedDateInput.value;

    if (!currentUserId) {
      
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Veuillez vous connecter d'abord.",
        customClass: {
          confirmButton: 'btn-custom-error'
        }
      })
      return;
    }

    const { error } = await database.from("products").insert([
      {
        name: productName,
        price: productPrice,
        quantity: productQuantity,
        date: selectedDate,
        user_id: currentUserId, // Ajouter l'ID de l'utilisateur
      },
    ]);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Erreur lors de l'ajout du produit.",
        customClass: {
          confirmButton: 'btn-custom-error'
        }
      });
      return;
    }

    
    Swal.fire({
      title: 'Produit ajouté avec succès!',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'btn-custom-success'
      }
    });
    addProductForm.reset();
    await fetchAndDisplayProducts(); // Rafraîchir la liste des produits
  });

 

 filterDateInput.addEventListener("change", async function () {
   await fetchAndDisplayProducts(); // Rafraîchir la liste des produits avec le filtre appliqué
 });

 async function fetchAndDisplayProducts() {
  console.log("Fetching Products");

  if (!currentUserId) {
    console.error("ID utilisateur non fourni.");
    return;
  }

  const selectedDate = filterDateInput.value;

  // Construire la requête en fonction de la présence ou non de selectedDate
  let query = database.from("products").select("*").eq("user_id", currentUserId);

  if (selectedDate) {
    query = query.eq("date", selectedDate); // Filtrer par date si elle est sélectionnée
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erreur lors de la récupération des produits:", error.message);
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: "Erreur lors de la sélection des produits.",
      customClass: {
        confirmButton: 'btn-custom-error'
      }
    });
    return;
    
  }

  const productList = document.getElementById("productList");
  const noProductsMessage = document.getElementById("noProductsMessage");
  const totalPriceSection = document.getElementById("totalPriceSection");
  const totalPriceElement = document.getElementById("totalPrice");

  productList.innerHTML = "";

  if (data.length === 0) {
    noProductsMessage.style.display = "block";
    totalPriceSection.style.display = "none"; // Cacher la section du total si pas de produits
  } else {
    noProductsMessage.style.display = "none";
    let totalPrice = 0; // Initialiser le total à 0

    data.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = `col-md-4 mb-4 `;
      productCard.innerHTML = `
        <div class="card mb-3 ${product.purchased ? 'purchased' : ''}">
          <div class="card-body">
            <h5 class="card-title">Libelle : ${product.name}</h5>
            <p class="card-text">Prix : ${product.price} FCFA</p>
            <p class="card-text">Quantité : ${product.quantity}</p>
            
            <div>
              <label>
                <input type="checkbox" ${product.purchased ? 'checked' : ''} data-product-id="${product.id}">
                Marquer comme acheté
              </label>
            </div>
           <div class="d-flex justify-content-start align-items-center" style="gap: 10px;">
          <button class="btn btn-outline-danger" onclick="deleteProduct(${product.id})">
            <img src="img/delete1.svg" alt="Supprimer"/>
          </button>
          <button class="btn btn-outline-warning" onclick="editProduct(${product.id})">
            <img src="img/edit.svg" alt="Éditer" />
          </button>
        </div>
          </div>
        </div>
      `;
      productList.appendChild(productCard);

      const checkbox = productCard.querySelector('input[type="checkbox"]');
      checkbox.addEventListener("change", async () => {
        await markAsPurchased(product.id, checkbox.checked);
      });

      // Ajouter au total
      totalPrice += product.price * product.quantity;
    });

    // Afficher le total
    totalPriceElement.innerText = totalPrice;
    totalPriceSection.style.display = "block";
    totalPriceSection.style.marginBottom = "50px";
  }
}

async function markAsPurchased(productId, isPurchased) {
  if (!currentUserId) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: "Veuillez vous connecter d'abord.",
      customClass: {
        confirmButton: 'btn-custom-error'
      }
    });
    return;
  }

  const { error } = await database.from("products")
    .update({ purchased: isPurchased })
    .eq("id", productId);

  if (error) {

    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: "Erreur lors de la mise à jour du produit.",
      customClass: {
        confirmButton: 'btn-custom-error'
      }
    });
    
    return;
  }

  
  Swal.fire({
    title: 'Statut du produit mis à jour !',
    icon: 'success',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'btn-custom-success'
    }
  });

  await fetchAndDisplayProducts(); // Rafraîchir la liste des produits
}


  window.deleteProduct = async function(productId) {
    if (!currentUserId) {
      
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Veuillez vous connecter d'abord.",
        customClass: {
          confirmButton: 'btn-custom-error'
        }
      })
      return;
    }

    const { data: product, error: fetchError } = await database
      .from("products")
      .select("user_id")
      .eq("id", productId)
      .single();

    if (fetchError) {
      alert("Erreur lors de la récupération du produit: " + fetchError.message);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Erreur lors de la suppression du produit.",
        customClass: {
          confirmButton: 'btn-custom-error'
        }
      })
      return;
    }

    if (product.user_id !== currentUserId) {
      
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Vous ne pouvez pas supprimer ce produit.",
        customClass: {
          confirmButton: 'btn-custom-error'
        }
      })
      return;
    }

    const { error: deleteError } = await database
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
     
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Erreur lors de la suppression du produit.",
        customClass: {
          confirmButton: 'btn-custom-error'
        }
      })
      return;
    }

    
    Swal.fire({
      title: 'Produit supprimé avec succès!',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'btn-custom-success'
      }
    });
    await fetchAndDisplayProducts(); // Rafraîchir la liste des produits
  };

 // Références aux éléments du formulaire de modification
 const editProductForm = document.getElementById("editProductForm");
 const cancelEditButton = document.getElementById("cancelEditButton");
 

 // Afficher le formulaire de modification avec les données du produit
 window.editProduct = async function(productId) {
   if (!currentUserId) {
     
     Swal.fire({
       icon: 'error',
       title: 'Erreur',
       text: "Veuillez vous connecter d'abord.",
       customClass: {
         confirmButton: 'btn-custom-error'
       }
     })
     return;
   }

   const { data: product, error } = await database
     .from("products")
     .select("*")
     .eq("id", productId)
     .single();

   if (error) {
    
     Swal.fire({
       icon: 'error',
       title: 'Erreur',
       text: "Erreur lors de la modification du produit.",
       customClass: {
         confirmButton: 'btn-custom-error'
       }
     })
     return;
   }

   if (product.user_id !== currentUserId) {
    
     Swal.fire({
       icon: 'error',
       title: 'Erreur',
       text: "Vous ne pouvez pas modifier ce produit.",
       customClass: {
         confirmButton: 'btn-custom-error'
       }
     })
     return;
   }

   document.getElementById("editProductId").value = product.id;
   document.getElementById("editProductName").value = product.name;
   document.getElementById("editProductPrice").value = product.price;
   document.getElementById("editProductQuantity").value = product.quantity;
   document.getElementById("editProductDate").value = product.date;

   editProductSection.style.display = "block";
   productListSection.style.display = "none";
 };

 // Soumettre les modifications du produit
 editProductForm.addEventListener("submit", async function (e) {
   e.preventDefault();

   const productId = document.getElementById("editProductId").value;
   const name = document.getElementById("editProductName").value;
   const price = document.getElementById("editProductPrice").value;
   const quantity = document.getElementById("editProductQuantity").value;
   const date = document.getElementById("editProductDate").value;

   if (!currentUserId) {
     
     Swal.fire({
       icon: 'error',
       title: 'Erreur',
       text: "Veuillez vous connecter d'abord.",
       customClass: {
         confirmButton: 'btn-custom-error'
       }
     })
     return;
   }

   const { error } = await database.from("products")
     .update({ name, price, quantity, date })
     .eq("id", productId);

   if (error) {
     
     Swal.fire({
       icon: 'error',
       title: 'Erreur',
       text: "Erreur lors de la modification du produit.",
       customClass: {
         confirmButton: 'btn-custom-error'
       }
     })
     return;
   }

   
   Swal.fire({
    title: 'Produit modifié avec succès!',
    icon: 'success',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'btn-custom-success'
    }
  });
   editProductSection.style.display = "none";
   productListSection.style.display = "block";
   await fetchAndDisplayProducts(); // Rafraîchir la liste des produits
 });

 // Annuler la modification du produit
 cancelEditButton.addEventListener("click", function() {
   editProductSection.style.display = "none";
   productListSection.style.display = "block";
 });
});
