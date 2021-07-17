const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const links = document.querySelectorAll(".nav-links li");

hamburger.addEventListener('click', () => {
    //Animate Links
    navLinks.classList.toggle("open");
    links.forEach(link => {
        link.classList.toggle("fade");
    });

    //Hamburger Animation
    hamburger.classList.toggle("toggle");
});


const productDOM = document.querySelector(".product__center");
const cartDOM = document.querySelector(".cart");
const cartContent = document.querySelector(".cart__centent");
const openCart = document.querySelector(".cart_icon");
const closeCart = document.querySelector(".close__cart");
const overlay = document.querySelector(".cart__overlay");
const cartTotal = document.querySelector(".cart__total");
const clearCartBtn = document.querySelector(".clear__cart");
const itemTotals = document.querySelector(".item__total");

let cart = [];

let buttonDOM = [];

class UI {
    displayProducts(products) {
        let results = "";
        products.forEach(({ title, price, image, id }) => {
            results += `<!-- Single Product -->
      <div class="product">
        <div class="image__container">
          <img src=${image} alt="" />
        </div>
        <div class="product__footer">
          <h1>${title}</h1>
          <div class="rating">
            <span>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-star-full"></use>
              </svg>
            </span>
            <span>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-star-full"></use>
              </svg>
            </span>
            <span>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-star-full"></use>
              </svg>
            </span>
            <span>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-star-full"></use>
              </svg>
            </span>
            <span>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-star-empty"></use>
              </svg>
            </span>
          </div><div class="price">RM${price}</div>
          </div>
          <div class="bottom">
            <div class="btn__group">
              <button class="btn addToCart" data-id= ${id} >Add to Cart</button>
              <button class="btn view" onclick="location.href='product.html'">Details</button>
            </div>
            
        </div>
      </div>
      <!-- End of Single Product -->`;
        });

        productDOM.innerHTML = results;
    }

    getButtons() {
        const buttons = [...document.querySelectorAll(".addToCart")];
        buttonDOM = buttons;
        buttons.forEach(button => {
            const id = button.dataset.id;
            const inCart = cart.find(item => item.id === parseInt(id, 10));

            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }

            button.addEventListener("click", e => {
                e.preventDefault();
                e.target.innerHTML = "In Cart";
                e.target.disabled = true;

                // Get product from products
                const cartItem = {...Storage.getProduct(id), amount: 1 };

                // Add product to cart
                cart = [...cart, cartItem];

                // save the cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setItemValues(cart);
                // display the cart item
                this.addCartItem(cartItem);
                // show the cart
            });
        });
    }

    setItemValues(cart) {
        let tempTotal = 0;
        let itemTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        itemTotals.innerText = itemTotal;
    }

    addCartItem({ image, price, title, id }) {
        const div = document.createElement("div");
        div.classList.add("cart__item");

        div.innerHTML = `<img src=${image}>
         
        
        <div>
            <h3>${title}</h3>
            <h3 class="price">RM${price}</h3>
          </div>
          <div>
            <span class="increase" data-id=${id}>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-angle-up"></use>
              </svg>
            </span>
            <p class="item__amount">1</p>
            <span class="decrease" data-id=${id}>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-angle-down"></use>
              </svg>
            </span>
          </div>

            <span class="remove__item" data-id=${id}>
              <svg>
                <use xlink:href="./images/sprite.svg#icon-trash"></use>
              </svg>
            </span>

        </div>`;
        cartContent.appendChild(div);
    }

    show() {
        cartDOM.classList.add("show");
        overlay.classList.add("show");
    }

    hide() {
        cartDOM.classList.remove("show");
        overlay.classList.remove("show");
    }

    setAPP() {
        cart = Storage.getCart();
        this.setItemValues(cart);
        this.populate(cart);

        openCart.addEventListener("click", this.show);
        closeCart.addEventListener("click", this.hide);
    }

    populate(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic() {
        // Clear Cart
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
            this.hide();
        });

        // Cart Functionality
        cartContent.addEventListener("click", e => {
            const target = e.target.closest("span");
            const targetElement = target.classList.contains("remove__item");
            if (!target) return;

            if (targetElement) {
                const id = parseInt(target.dataset.id);
                this.removeItem(id);
                cartContent.removeChild(target.parentElement);
            } else if (target.classList.contains("increase")) {
                const id = parseInt(target.dataset.id, 10);
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount++;
                Storage.saveCart(cart);
                this.setItemValues(cart);
                target.nextElementSibling.innerText = tempItem.amount;
            } else if (target.classList.contains("decrease")) {
                const id = parseInt(target.dataset.id, 10);
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount--;

                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setItemValues(cart);
                    target.previousElementSibling.innerText = tempItem.amount;
                } else {
                    this.removeItem(id);
                    cartContent.removeChild(target.parentElement.parentElement);
                }
            }
        });
    }

    clearCart() {
        const cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setItemValues(cart);
        Storage.saveCart(cart);

        let button = this.singleButton(id);
        button.disabled = false;
        button.innerText = "Add to Cart";
    }

    singleButton(id) {
        return buttonDOM.find(button => parseInt(button.dataset.id) === id);
    }
}

class Products {
    async getProducts() {
        try {
            const result = await fetch("products.json");
            const data = await result.json();
            const products = data.items;
            return products;
        } catch (err) {
            console.log(err);
        }
    }
}

class Storage {
    static saveProduct(obj) {
        localStorage.setItem("products", JSON.stringify(obj));
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getProduct(id) {
        const products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === parseFloat(id, 10));
    }

    static getCart() {
        return localStorage.getItem("cart") ?
            JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", async() => {
    const productList = new Products();
    const ui = new UI();

    ui.setAPP();

    const products = await productList.getProducts();
    ui.displayProducts(products);
    Storage.saveProduct(products);
    ui.getButtons();
    ui.cartLogic();
});



$(document).ready(function() {
    $(".drop .option").click(function() {
        var val = $(this).attr("data-value"),
            $drop = $(".drop"),
            prevActive = $(".drop .option.active").attr("data-value"),
            options = $(".drop .option").length;
        $drop.find(".option.active").addClass("mini-hack");
        $drop.toggleClass("visible");
        $drop.removeClass("withBG");
        $(this).css("top");
        $drop.toggleClass("opacity");
        $(".mini-hack").removeClass("mini-hack");
        if ($drop.hasClass("visible")) {
            setTimeout(function() {
                $drop.addClass("withBG");
            }, 400 + options * 100);
        }
        triggerAnimation();
        if (val !== "placeholder" || prevActive === "placeholder") {
            $(".drop .option").removeClass("active");
            $(this).addClass("active");
        };
    });

    function triggerAnimation() {
        var finalWidth = $(".drop").hasClass("visible") ? 22 : 20;
        $(".drop").css("width", "24em");
        setTimeout(function() {
            $(".drop").css("width", finalWidth + "em");
        }, 400);
    }
});



$('.sizes a span, .categories a span').each(function(i, el) {
    $(el).append('<span class="x"></span><span class="y"></span>');

    $(el).parent().on('click', function() {
        if ($(this).hasClass('checked')) {
            $(el).find('.y').removeClass('animate');
            setTimeout(function() {
                $(el).find('.x').removeClass('animate');
            }, 50);
            $(this).removeClass('checked');
            return false;
        }

        $(el).find('.x').addClass('animate');
        setTimeout(function() {
            $(el).find('.y').addClass('animate');
        }, 100);
        $(this).addClass('checked');
        return false;
    });
});


$(function() {
    $("#btnreset").bind("click", function() {
        $("#select")[0].selectedIndex = 0;
    });
});


// document.querySelector('.close').addEventListener('click',function() {
//   var grand = this.parentNode.parentNode;
//   this.parentNode.parentNode.style.animation = "toast .5s ease-out forwards";
//   setTimeout(() => {grand.remove();} ,500);
// })

document.querySelector('.buttontoast').addEventListener('click', function() {
    var child = document.getElementById('clonemother');
    var clone = child.cloneNode(true);
    // console.log(clone);
    // document.querySelector('.toast-area').appendChild(child.firstChild);
    var node = document.getElementById("toasts").appendChild(clone);
    console.log(node.childNodes);
    setTimeout(function() {
        if (node) {
            node.childNodes[1].childNodes[5].childNodes[1].innerHTML = "Have a Nice Day!"
        }
    }, 1000);
    setTimeout(function() {
        if (node) {
            node.style.animation = "toast 13.90s ease-out forwards";
            setTimeout(() => { node.remove(); }, 9900);
        }
    }, 2000);
})

// document.querySelectorAll('.close').forEach(function(t) {t.addEventListener('click',function(e) {
//   var grand = e.target.parentNode.parentNode;
//   grand.style.animation = "toast .5s ease-out forwards";
//   setTimeout(() => {grand.remove();} ,500);
// })})

function deletethis() {
    var e = window.event;
    var grand = e.target.parentNode.parentNode;
    grand.style.animation = "toast 13.90s ease-out forwards";
    setTimeout(() => { grand.remove(); }, 0);
}