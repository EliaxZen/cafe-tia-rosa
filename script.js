/**
 * Classe principal da aplicação
 * Gerencia todos os módulos e inicializações
 */
class CafeApp {
  constructor() {
    // Elementos DOM
    this.domElements = {
      body: document.body,
      header: document.getElementById('main-header'),
      menuToggle: document.querySelector('.menu-toggle'),
      menu: document.getElementById('main-menu'),
      backToTop: document.querySelector('.back-to-top'),
      themeToggle: document.querySelector('.theme-toggle'),
      contactForm: document.getElementById('contactForm'),
      newsletterForm: document.getElementById('newsletterForm'),
      modal: document.querySelector('.modal'),
      modalClose: document.querySelector('.modal-close'),
      productDetailsButtons: document.querySelectorAll('.btn-outline'),
    }

    // Estado da aplicação
    this.state = {
      currentTheme: localStorage.getItem('theme') || 'light',
      menuOpen: false,
      modalContent: null,
    }

    // Inicializa todos os módulos
    this.initModules()
  }

  /**
   * Inicializa todos os módulos da aplicação
   */
  initModules() {
    try {
      this.scrollHandler = new ScrollHandler(this.domElements, this.state)
      this.mobileMenu = new MobileMenu(
        this.domElements.menuToggle,
        this.domElements.menu,
        this.state,
      )
      this.carousel = new Carousel('.carousel-container')
      this.themeSwitcher = new ThemeSwitcher(this.domElements.themeToggle, this.state)
      this.formValidator = new FormValidator(this.domElements.contactForm)
      this.newsletterForm = new NewsletterForm(this.domElements.newsletterForm)
      this.modal = new Modal(this.domElements.modal, this.domElements.modalClose, this.state)
      this.productDetails = new ProductDetails(
        this.domElements.productDetailsButtons,
        this.domElements.modal,
        this.state,
      )

      // Inicializa observador de interseção
      this.initIntersectionObserver()

      // Inicializa tabs de produtos
      this.initProductTabs()

      console.log('Aplicação inicializada com sucesso')
    } catch (error) {
      console.error('Erro ao inicializar a aplicação:', error)
      this.showErrorToUser()
    }
  }

  /**
   * Mostra mensagem de erro para o usuário
   */
  showErrorToUser() {
    const errorElement = document.createElement('div')
    errorElement.className = 'global-error'
    errorElement.innerHTML = `
            <p>Ocorreu um erro ao carregar a aplicação. Por favor, recarregue a página.</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Recarregar</button>
        `
    document.body.prepend(errorElement)
  }

  /**
   * Inicializa o Intersection Observer para as seções
   */
  initIntersectionObserver() {
    try {
      const sections = document.querySelectorAll('.section')
      const menuLinks = document.querySelectorAll('.menu-link')

      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
      }

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section')

            // Remove a classe active de todos os links
            menuLinks.forEach(link => {
              link.classList.remove('active')
            })

            // Adiciona a classe active ao link correspondente
            const activeLink = document.querySelector(`.menu-link[data-section="${sectionId}"]`)
            if (activeLink) {
              activeLink.classList.add('active')
            }
          }
        })
      }, observerOptions)

      sections.forEach(section => {
        observer.observe(section)
      })
    } catch (error) {
      console.error('Erro no Intersection Observer:', error)
    }
  }

  /**
   * Inicializa as tabs de produtos
   */
  initProductTabs() {
    try {
      const tabButtons = document.querySelectorAll('.tab-button')
      const tabContents = document.querySelectorAll('.tab-content')

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tabId = button.getAttribute('data-tab')

          // Remove a classe active de todos os botões e conteúdos
          tabButtons.forEach(btn => btn.classList.remove('active'))
          tabContents.forEach(content => content.classList.remove('active'))

          // Adiciona a classe active ao botão e conteúdo correspondentes
          button.classList.add('active')
          document.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active')
        })
      })
    } catch (error) {
      console.error('Erro ao inicializar as tabs de produtos:', error)
    }
  }
}

/**
 * Classe para manipulação do scroll
 */
class ScrollHandler {
  constructor(elements, state) {
    this.header = elements.header
    this.backToTop = elements.backToTop
    this.state = state

    this.handleScroll = this.handleScroll.bind(this)
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    this.handleScroll() // Executa imediatamente para verificar a posição inicial
  }

  /**
   * Manipula o evento de scroll
   */
  handleScroll() {
    try {
      const scrollPosition = window.scrollY

      // Header scroll effect
      if (scrollPosition > 100) {
        this.header.classList.add('scrolled')
      } else {
        this.header.classList.remove('scrolled')
      }

      // Back to top button
      if (scrollPosition > 300) {
        this.backToTop.classList.add('visible')
      } else {
        this.backToTop.classList.remove('visible')
      }
    } catch (error) {
      console.error('Erro no manipulador de scroll:', error)
    }
  }
}

/**
 * Classe para menu mobile
 */
class MobileMenu {
  constructor(toggleButton, menu, state) {
    this.toggleButton = toggleButton
    this.menu = menu
    this.state = state

    this.toggleButton.addEventListener('click', this.toggleMenu.bind(this))

    // Fecha o menu ao clicar em um link
    const menuLinks = this.menu.querySelectorAll('.menu-link')
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.state.menuOpen) {
          this.toggleMenu()
        }
      })
    })
  }

  /**
   * Alterna o estado do menu mobile
   */
  toggleMenu() {
    try {
      this.state.menuOpen = !this.state.menuOpen
      this.toggleButton.classList.toggle('active')
      this.menu.classList.toggle('active')
      document.body.classList.toggle('no-scroll')

      // Acessibilidade: atualiza o atributo aria-expanded
      this.toggleButton.setAttribute('aria-expanded', this.state.menuOpen)
    } catch (error) {
      console.error('Erro ao alternar o menu:', error)
    }
  }
}

/**
 * Classe para o carrossel
 */
class Carousel {
  constructor(selector) {
    this.container = document.querySelector(selector)
    if (!this.container) {
      console.error('Elemento do carrossel não encontrado')
      return
    }

    this.track = this.container.querySelector('.carousel-track')
    this.slides = Array.from(this.container.querySelectorAll('.carousel-slide'))
    this.prevButton = this.container.querySelector('.carousel-prev')
    this.nextButton = this.container.querySelector('.carousel-next')
    this.indicators = Array.from(this.container.querySelectorAll('.carousel-indicator'))

    this.currentIndex = 0
    this.slideCount = this.slides.length
    this.autoPlayInterval = null
    this.autoPlayDelay = 5000
    this.isDragging = false
    this.startX = 0
    this.currentX = 0

    // Inicializa o carrossel
    this.init()
  }

  /**
   * Inicializa o carrossel
   */
  init() {
    try {
      // Configura os eventos
      if (this.prevButton && this.nextButton) {
        this.prevButton.addEventListener('click', () => this.goToPrev())
        this.nextButton.addEventListener('click', () => this.goToNext())
      }

      // Configura os indicadores
      this.indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => this.goToSlide(index))
      })

      // Configura o touch/swipe
      this.setupTouchEvents()

      // Inicia o autoplay
      this.startAutoPlay()

      // Atualiza a posição inicial
      this.updateCarousel()
    } catch (error) {
      console.error('Erro ao inicializar o carrossel:', error)
    }
  }

  /**
   * Vai para o slide anterior
   */
  goToPrev() {
    try {
      this.currentIndex = (this.currentIndex - 1 + this.slideCount) % this.slideCount
      this.updateCarousel()
      this.resetAutoPlay()
    } catch (error) {
      console.error('Erro ao ir para o slide anterior:', error)
    }
  }

  /**
   * Vai para o próximo slide
   */
  goToNext() {
    try {
      this.currentIndex = (this.currentIndex + 1) % this.slideCount
      this.updateCarousel()
      this.resetAutoPlay()
    } catch (error) {
      console.error('Erro ao ir para o próximo slide:', error)
    }
  }

  /**
   * Vai para um slide específico
   * @param {number} index - Índice do slide
   */
  goToSlide(index) {
    try {
      if (index < 0 || index >= this.slideCount) {
        console.error('Índice do slide inválido:', index)
        return
      }

      this.currentIndex = index
      this.updateCarousel()
      this.resetAutoPlay()
    } catch (error) {
      console.error('Erro ao ir para o slide específico:', error)
    }
  }

  /**
   * Atualiza a exibição do carrossel
   */
  updateCarousel() {
    try {
      // Atualiza a posição do track
      this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`

      // Atualiza os indicadores
      this.indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === this.currentIndex)
      })

      // Atualiza os slides
      this.slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === this.currentIndex)
      })
    } catch (error) {
      console.error('Erro ao atualizar o carrossel:', error)
    }
  }

  /**
   * Configura eventos de touch/swipe
   */
  setupTouchEvents() {
    try {
      this.track.addEventListener(
        'touchstart',
        e => {
          this.startX = e.touches[0].clientX
          this.currentX = this.startX
          this.isDragging = true
          this.track.style.transition = 'none'
          this.pauseAutoPlay()
        },
        { passive: true },
      )

      this.track.addEventListener(
        'touchmove',
        e => {
          if (!this.isDragging) return
          this.currentX = e.touches[0].clientX
          const diff = this.currentX - this.startX
          this.track.style.transform = `translateX(calc(-${this.currentIndex * 100}% + ${diff}px)`
        },
        { passive: true },
      )

      this.track.addEventListener(
        'touchend',
        () => {
          if (!this.isDragging) return
          this.isDragging = false

          const diff = this.currentX - this.startX
          this.track.style.transition = 'transform 0.5s ease-in-out'

          if (Math.abs(diff) > 50) {
            if (diff > 0) {
              this.goToPrev()
            } else {
              this.goToNext()
            }
          } else {
            this.updateCarousel()
          }

          this.startAutoPlay()
        },
        { passive: true },
      )

      // Suporte a mouse para desktop
      this.track.addEventListener('mousedown', e => {
        this.startX = e.clientX
        this.currentX = this.startX
        this.isDragging = true
        this.track.style.transition = 'none'
        this.pauseAutoPlay()
        e.preventDefault()
      })

      document.addEventListener('mousemove', e => {
        if (!this.isDragging) return
        this.currentX = e.clientX
        const diff = this.currentX - this.startX
        this.track.style.transform = `translateX(calc(-${this.currentIndex * 100}% + ${diff}px)`
      })

      document.addEventListener('mouseup', () => {
        if (!this.isDragging) return
        this.isDragging = false

        const diff = this.currentX - this.startX
        this.track.style.transition = 'transform 0.5s ease-in-out'

        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.goToPrev()
          } else {
            this.goToNext()
          }
        } else {
          this.updateCarousel()
        }

        this.startAutoPlay()
      })
    } catch (error) {
      console.error('Erro ao configurar eventos de touch:', error)
    }
  }

  /**
   * Inicia o autoplay
   */
  startAutoPlay() {
    try {
      if (this.autoPlayInterval) clearInterval(this.autoPlayInterval)
      this.autoPlayInterval = setInterval(() => this.goToNext(), this.autoPlayDelay)
    } catch (error) {
      console.error('Erro ao iniciar o autoplay:', error)
    }
  }

  /**
   * Pausa o autoplay
   */
  pauseAutoPlay() {
    try {
      if (this.autoPlayInterval) clearInterval(this.autoPlayInterval)
    } catch (error) {
      console.error('Erro ao pausar o autoplay:', error)
    }
  }

  /**
   * Reinicia o autoplay
   */
  resetAutoPlay() {
    try {
      this.pauseAutoPlay()
      this.startAutoPlay()
    } catch (error) {
      console.error('Erro ao reiniciar o autoplay:', error)
    }
  }
}

/**
 * Classe para alternar entre temas claro e escuro
 */
class ThemeSwitcher {
  constructor(toggleButton, state) {
    this.toggleButton = toggleButton
    this.state = state

    this.init()
  }

  /**
   * Inicializa o theme switcher
   */
  init() {
    try {
      // Aplica o tema salvo
      this.applyTheme()

      // Configura o evento de clique
      this.toggleButton.addEventListener('click', () => this.toggleTheme())
    } catch (error) {
      console.error('Erro ao inicializar o theme switcher:', error)
    }
  }

  /**
   * Aplica o tema atual
   */
  applyTheme() {
    try {
      document.documentElement.setAttribute('data-theme', this.state.currentTheme)
      localStorage.setItem('theme', this.state.currentTheme)

      // Atualiza o ícone do botão
      const icon = this.toggleButton.querySelector('i')
      if (this.state.currentTheme === 'dark') {
        icon.classList.replace('fa-moon', 'fa-sun')
      } else {
        icon.classList.replace('fa-sun', 'fa-moon')
      }
    } catch (error) {
      console.error('Erro ao aplicar o tema:', error)
    }
  }

  /**
   * Alterna entre temas claro e escuro
   */
  toggleTheme() {
    try {
      this.state.currentTheme = this.state.currentTheme === 'light' ? 'dark' : 'light'
      this.applyTheme()
    } catch (error) {
      console.error('Erro ao alternar o tema:', error)
    }
  }
}

/**
 * Classe para validação de formulário
 */
class FormValidator {
  constructor(form) {
    this.form = form
    if (!this.form) {
      console.error('Formulário não encontrado')
      return
    }

    this.fields = {
      name: this.form.querySelector('#name'),
      email: this.form.querySelector('#email'),
      message: this.form.querySelector('#message'),
    }

    this.init()
  }

  /**
   * Inicializa a validação do formulário
   */
  init() {
    try {
      this.form.addEventListener('submit', e => this.handleSubmit(e))

      // Validação em tempo real
      Object.values(this.fields).forEach(field => {
        field.addEventListener('input', () => this.validateField(field))
      })
    } catch (error) {
      console.error('Erro ao inicializar a validação do formulário:', error)
    }
  }

  /**
   * Valida um campo do formulário
   * @param {HTMLElement} field - Campo a ser validado
   * @returns {boolean} - Retorna true se o campo for válido
   */
  validateField(field) {
    try {
      const fieldName = field.getAttribute('id')
      const fieldValue = field.value.trim()
      const fieldGroup = field.closest('.form-group')
      const errorMessage = fieldGroup.querySelector('.error-message')

      let isValid = true
      let error = ''

      switch (fieldName) {
        case 'name':
          if (fieldValue === '') {
            error = 'Por favor, insira seu nome'
            isValid = false
          } else if (fieldValue.length < 3) {
            error = 'O nome deve ter pelo menos 3 caracteres'
            isValid = false
          }
          break

        case 'email':
          if (fieldValue === '') {
            error = 'Por favor, insira seu email'
            isValid = false
          } else if (!this.isValidEmail(fieldValue)) {
            error = 'Por favor, insira um email válido'
            isValid = false
          }
          break

        case 'message':
          if (fieldValue === '') {
            error = 'Por favor, insira sua mensagem'
            isValid = false
          } else if (fieldValue.length < 10) {
            error = 'A mensagem deve ter pelo menos 10 caracteres'
            isValid = false
          }
          break
      }

      // Atualiza o estado do campo
      if (isValid) {
        fieldGroup.classList.remove('error')
        errorMessage.textContent = ''
        errorMessage.style.display = 'none'
      } else {
        fieldGroup.classList.add('error')
        errorMessage.textContent = error
        errorMessage.style.display = 'block'
      }

      return isValid
    } catch (error) {
      console.error('Erro ao validar campo:', error)
      return false
    }
  }

  /**
   * Verifica se um email é válido
   * @param {string} email - Email a ser validado
   * @returns {boolean} - Retorna true se o email for válido
   */
  isValidEmail(email) {
    try {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    } catch (error) {
      console.error('Erro ao validar email:', error)
      return false
    }
  }

  /**
   * Manipula o envio do formulário
   * @param {Event} e - Evento de submit
   */
  handleSubmit(e) {
    try {
      e.preventDefault()

      // Valida todos os campos
      let isFormValid = true
      Object.values(this.fields).forEach(field => {
        const isValid = this.validateField(field)
        if (!isValid) isFormValid = false
      })

      // Se o formulário for válido, envia
      if (isFormValid) {
        this.submitForm()
      }
    } catch (error) {
      console.error('Erro ao submeter o formulário:', error)
    }
  }

  /**
   * Simula o envio do formulário
   */
  submitForm() {
    try {
      const formData = new FormData(this.form)
      const formObject = Object.fromEntries(formData.entries())

      console.log('Formulário enviado:', formObject)

      // Exibe mensagem de sucesso
      this.showSuccessMessage('Mensagem enviada com sucesso! Entraremos em contato em breve.')

      // Reseta o formulário
      this.form.reset()

      // Remove os estados de erro
      document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error')
        const errorMessage = group.querySelector('.error-message')
        errorMessage.textContent = ''
        errorMessage.style.display = 'none'
      })
    } catch (error) {
      console.error('Erro ao enviar o formulário:', error)
      this.showErrorMessage(
        'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.',
      )
    }
  }

  /**
   * Exibe uma mensagem de sucesso
   * @param {string} message - Mensagem a ser exibida
   */
  showSuccessMessage(message) {
    const successElement = document.createElement('div')
    successElement.className = 'form-success'
    successElement.textContent = message
    this.form.prepend(successElement)

    setTimeout(() => {
      successElement.remove()
    }, 5000)
  }

  /**
   * Exibe uma mensagem de erro
   * @param {string} message - Mensagem a ser exibida
   */
  showErrorMessage(message) {
    const errorElement = document.createElement('div')
    errorElement.className = 'form-error'
    errorElement.textContent = message
    this.form.prepend(errorElement)

    setTimeout(() => {
      errorElement.remove()
    }, 5000)
  }
}

/**
 * Classe para o formulário de newsletter
 */
class NewsletterForm {
  constructor(form) {
    this.form = form
    if (!this.form) {
      console.error('Formulário de newsletter não encontrado')
      return
    }

    this.emailInput = this.form.querySelector('input[type="email"]')
    this.init()
  }

  /**
   * Inicializa o formulário de newsletter
   */
  init() {
    try {
      this.form.addEventListener('submit', e => this.handleSubmit(e))
    } catch (error) {
      console.error('Erro ao inicializar o formulário de newsletter:', error)
    }
  }

  /**
   * Manipula o envio do formulário
   * @param {Event} e - Evento de submit
   */
  handleSubmit(e) {
    try {
      e.preventDefault()

      const email = this.emailInput.value.trim()

      if (!email) {
        this.showError('Por favor, insira seu email')
        return
      }

      if (!this.isValidEmail(email)) {
        this.showError('Por favor, insira um email válido')
        return
      }

      // Simula o envio do formulário
      console.log('Email cadastrado:', email)

      // Exibe mensagem de sucesso
      this.showSuccess('Obrigado por assinar nossa newsletter!')

      // Reseta o formulário
      this.form.reset()
    } catch (error) {
      console.error('Erro ao submeter o formulário de newsletter:', error)
      this.showError('Ocorreu um erro. Por favor, tente novamente.')
    }
  }

  /**
   * Verifica se um email é válido
   * @param {string} email - Email a ser validado
   * @returns {boolean} - Retorna true se o email for válido
   */
  isValidEmail(email) {
    try {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    } catch (error) {
      console.error('Erro ao validar email:', error)
      return false
    }
  }

  /**
   * Exibe mensagem de erro
   * @param {string} message - Mensagem a ser exibida
   */
  showError(message) {
    const errorElement = document.createElement('div')
    errorElement.className = 'newsletter-error'
    errorElement.textContent = message
    this.form.insertBefore(errorElement, this.form.lastElementChild)

    setTimeout(() => {
      errorElement.remove()
    }, 5000)
  }

  /**
   * Exibe mensagem de sucesso
   * @param {string} message - Mensagem a ser exibida
   */
  showSuccess(message) {
    const successElement = document.createElement('div')
    successElement.className = 'newsletter-success'
    successElement.textContent = message
    this.form.insertBefore(successElement, this.form.lastElementChild)

    setTimeout(() => {
      successElement.remove()
    }, 5000)
  }
}

/**
 * Classe para o modal
 */
class Modal {
  constructor(modalElement, closeButton, state) {
    this.modal = modalElement
    this.closeButton = closeButton
    this.state = state

    this.init()
  }

  /**
   * Inicializa o modal
   */
  init() {
    try {
      // Fecha o modal ao clicar no botão de fechar
      if (this.closeButton) {
        this.closeButton.addEventListener('click', () => this.close())
      }

      // Fecha o modal ao clicar fora do conteúdo
      this.modal.addEventListener('click', e => {
        if (e.target === this.modal) {
          this.close()
        }
      })

      // Fecha o modal com a tecla ESC
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this.modal.classList.contains('active')) {
          this.close()
        }
      })
    } catch (error) {
      console.error('Erro ao inicializar o modal:', error)
    }
  }

  /**
   * Abre o modal
   * @param {string} content - Conteúdo HTML a ser exibido no modal
   */
  open(content = '') {
    try {
      if (content) {
        const modalBody = this.modal.querySelector('.modal-body')
        modalBody.innerHTML = content
      }

      this.modal.classList.add('active')
      document.body.classList.add('no-scroll')

      // Foca no modal para acessibilidade
      this.modal.setAttribute('aria-hidden', 'false')
      this.modal.focus()
    } catch (error) {
      console.error('Erro ao abrir o modal:', error)
    }
  }

  /**
   * Fecha o modal
   */
  close() {
    try {
      this.modal.classList.remove('active')
      document.body.classList.remove('no-scroll')

      // Atualiza estado para acessibilidade
      this.modal.setAttribute('aria-hidden', 'true')
    } catch (error) {
      console.error('Erro ao fechar o modal:', error)
    }
  }
}

/**
 * Classe para detalhes do produto
 */
class ProductDetails {
  constructor(buttons, modal, state) {
    this.buttons = buttons
    this.modal = modal
    this.state = state
    this.modalInstance = new Modal(this.modal, this.modal.querySelector('.modal-close'), this.state)

    this.init()
  }

  /**
   * Inicializa os eventos dos botões
   */
  init() {
    try {
      this.buttons.forEach(button => {
        button.addEventListener('click', e => {
          e.preventDefault()
          this.showProductDetails(button)
        })
      })
    } catch (error) {
      console.error('Erro ao inicializar os detalhes do produto:', error)
    }
  }

  /**
   * Mostra os detalhes do produto no modal
   * @param {HTMLElement} button - Botão que acionou o evento
   */
  showProductDetails(button) {
    try {
      // Obtém os dados do produto do elemento pai
      const productCard = button.closest('.product-card')
      const title = productCard.querySelector('.product-title').textContent
      const description = productCard.querySelector('.product-description').textContent
      const price = productCard.querySelector('.product-price').textContent
      const imageSrc = productCard.querySelector('img').src

      // Cria o conteúdo do modal
      const content = `
                <div class="product-modal-content">
                    <div class="product-modal-image">
                        <img src="${imageSrc}" alt="${title}" loading="lazy">
                    </div>
                    <div class="product-modal-info">
                        <h3 class="product-modal-title">${title}</h3>
                        <p class="product-modal-description">${description}</p>
                        <div class="product-modal-price">${price}</div>
                        <button class="btn btn-primary">Adicionar ao Carrinho</button>
                    </div>
                </div>
            `

      // Abre o modal com o conteúdo
      this.modalInstance.open(content)
    } catch (error) {
      console.error('Erro ao mostrar detalhes do produto:', error)
      this.modalInstance.open('<p>Ocorreu um erro ao carregar os detalhes do produto.</p>')
    }
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = new CafeApp()
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error)
    const errorElement = document.createElement('div')
    errorElement.className = 'global-error'
    errorElement.innerHTML = `
            <p>Ocorreu um erro ao carregar a aplicação. Por favor, recarregue a página.</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Recarregar</button>
        `
    document.body.prepend(errorElement)
  }
})

// Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope)
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err)
      })
  })
}
