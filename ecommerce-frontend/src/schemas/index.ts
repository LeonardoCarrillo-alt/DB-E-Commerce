import { z } from 'zod'

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es muy largo'),
    email: z
      .string()
      .min(1, 'El email es obligatorio')
      .email('Ingresa un email válido'),
    telefono: z
      .string()
      .optional()
      .refine((val) => !val || /^\+?[\d\s\-()]{7,15}$/.test(val), {
        message: 'Teléfono inválido',
      }),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

// ─── Checkout ─────────────────────────────────────────────────────────────────
export const checkoutSchema = z.object({
  nombre: z.string().min(2, 'Nombre obligatorio'),
  apellido: z.string().min(2, 'Apellido obligatorio'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(7, 'Teléfono obligatorio'),
  calle: z.string().min(5, 'Dirección obligatoria'),
  ciudad: z.string().min(2, 'Ciudad obligatoria'),
  departamento: z.string().min(2, 'Departamento obligatorio'),
  codigoPostal: z.string().optional(),
  metodoPago: z.enum(['TARJETA', 'TRANSFERENCIA', 'EFECTIVO'], {
    errorMap: () => ({ message: 'Selecciona un método de pago' }),
  }),
  // Solo requerido si metodoPago === 'TARJETA'
  numeroTarjeta: z.string().optional(),
  nombreTarjeta: z.string().optional(),
  expiracion: z.string().optional(),
  cvv: z.string().optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

// ─── Product (Admin) ──────────────────────────────────────────────────────────
export const productSchema = z.object({
  nombre: z.string().min(2, 'Nombre obligatorio'),
  descripcion: z.string().min(10, 'Descripción mínima de 10 caracteres'),
  precio: z.coerce.number().positive('El precio debe ser positivo'),
  stock: z.coerce.number().int().min(0, 'Stock no puede ser negativo'),
  categoria: z.string().min(1, 'Selecciona una categoría'),
  marca: z.string().optional(),
  etiquetas: z.string().optional(), // CSV, se parsea al enviar
})

export type ProductFormValues = z.infer<typeof productSchema>
