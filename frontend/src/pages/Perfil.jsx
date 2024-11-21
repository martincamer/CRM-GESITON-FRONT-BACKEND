import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Lock,
  Edit,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const Perfil = () => {
  const { auth, actualizarPerfil, actualizarPassword } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      nombre: auth.user.nombre,
      email: auth.user.email,
      telefono: auth.user.telefono || "",
      empresa: auth.user.empresa || "",
      direccion: auth.user.direccion || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await actualizarPerfil(data);
      setEditMode(false);
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar el perfil");
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      await actualizarPassword(data);
      setChangePassword(false);
      toast.success("Contraseña actualizada correctamente");
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Error al actualizar la contraseña");
    }
  };

  return (
    <Container>
      <Header>
        <h1>Mi Perfil</h1>
        {!editMode && (
          <EditButton onClick={() => setEditMode(true)}>
            <Edit size={16} />
            Editar Perfil
          </EditButton>
        )}
      </Header>

      <ContentGrid>
        <ProfileCard>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ProfileSection>
              <SectionTitle>Información Personal</SectionTitle>

              <FieldGroup>
                <FieldIcon>
                  <User />
                </FieldIcon>
                <FieldContent>
                  <Label>Nombre</Label>
                  {editMode ? (
                    <Input
                      {...register("nombre", {
                        required: "El nombre es requerido",
                      })}
                      error={errors.nombre}
                    />
                  ) : (
                    <Value>{auth.user.nombre}</Value>
                  )}
                </FieldContent>
              </FieldGroup>

              <FieldGroup>
                <FieldIcon>
                  <Mail />
                </FieldIcon>
                <FieldContent>
                  <Label>Email</Label>
                  {editMode ? (
                    <Input
                      {...register("email", {
                        required: "El email es requerido",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email inválido",
                        },
                      })}
                      error={errors.email}
                    />
                  ) : (
                    <Value>{auth.user.email}</Value>
                  )}
                </FieldContent>
              </FieldGroup>

              <FieldGroup>
                <FieldIcon>
                  <Phone />
                </FieldIcon>
                <FieldContent>
                  <Label>Teléfono</Label>
                  {editMode ? (
                    <Input {...register("telefono")} />
                  ) : (
                    <Value>{auth.user.telefono || "-"}</Value>
                  )}
                </FieldContent>
              </FieldGroup>

              <FieldGroup>
                <FieldIcon>
                  <Building />
                </FieldIcon>
                <FieldContent>
                  <Label>Empresa</Label>
                  {editMode ? (
                    <Input {...register("empresa")} />
                  ) : (
                    <Value>{auth.user.empresa || "-"}</Value>
                  )}
                </FieldContent>
              </FieldGroup>

              <FieldGroup>
                <FieldIcon>
                  <MapPin />
                </FieldIcon>
                <FieldContent>
                  <Label>Dirección</Label>
                  {editMode ? (
                    <Input {...register("direccion")} />
                  ) : (
                    <Value>{auth.user.direccion || "-"}</Value>
                  )}
                </FieldContent>
              </FieldGroup>

              {editMode && (
                <ButtonGroup>
                  <SaveButton type="submit">
                    <Save size={16} />
                    Guardar Cambios
                  </SaveButton>
                  <CancelButton
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      reset();
                    }}
                  >
                    <X size={16} />
                    Cancelar
                  </CancelButton>
                </ButtonGroup>
              )}
            </ProfileSection>
          </form>
        </ProfileCard>

        <SecurityCard>
          <ProfileSection>
            <SectionTitle>
              <Lock size={20} />
              Seguridad
            </SectionTitle>

            {!changePassword ? (
              <ChangePasswordButton onClick={() => setChangePassword(true)}>
                Cambiar Contraseña
              </ChangePasswordButton>
            ) : (
              <form onSubmit={handleSubmit(onPasswordSubmit)}>
                <PasswordField>
                  <Label>Contraseña Actual</Label>
                  <Input
                    type="password"
                    {...register("currentPassword", {
                      required: "La contraseña actual es requerida",
                    })}
                    error={errors.currentPassword}
                  />
                </PasswordField>

                <PasswordField>
                  <Label>Nueva Contraseña</Label>
                  <Input
                    type="password"
                    {...register("newPassword", {
                      required: "La nueva contraseña es requerida",
                      minLength: {
                        value: 6,
                        message:
                          "La contraseña debe tener al menos 6 caracteres",
                      },
                    })}
                    error={errors.newPassword}
                  />
                </PasswordField>

                <PasswordField>
                  <Label>Confirmar Nueva Contraseña</Label>
                  <Input
                    type="password"
                    {...register("confirmPassword", {
                      validate: (value) =>
                        value === watch("newPassword") ||
                        "Las contraseñas no coinciden",
                    })}
                    error={errors.confirmPassword}
                  />
                </PasswordField>

                <ButtonGroup>
                  <SaveButton type="submit">
                    <Save size={16} />
                    Actualizar Contraseña
                  </SaveButton>
                  <CancelButton
                    type="button"
                    onClick={() => {
                      setChangePassword(false);
                      reset();
                    }}
                  >
                    <X size={16} />
                    Cancelar
                  </CancelButton>
                </ButtonGroup>
              </form>
            )}
          </ProfileSection>
        </SecurityCard>
      </ContentGrid>
    </Container>
  );
};

// Estilos
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.875rem;
    font-weight: 600;
    color: #111827;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
`;

const SecurityCard = styled(ProfileCard)``;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Componentes estilizados
const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const FieldIcon = styled.div`
  color: #6b7280;
  width: 24px;
`;

const FieldContent = styled.div`
  flex: 1;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Value = styled.div`
  color: #111827;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${(props) => (props.error ? "#ef4444" : "#d1d5db")};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  background-color: ${(props) => (props.disabled ? "#f3f4f6" : "white")};

  &:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 2px solid #3b82f680;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 1.5rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const PasswordField = styled.div`
  margin-bottom: 1rem;
`;

const ChangePasswordButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

export default Perfil;
