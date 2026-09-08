import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function enrollScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentNim, setStudentNim] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.stepContainer}>
          <Text style={styles.defaultText}>
            Camera permission is required for face enrollment.
          </Text>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });
        setPhotoUri(photo.uri);
        setModalVisible(true);

        //TODO: FastAPI call to send the photo to the backend for face recognition and attendance marking
      } catch (error) {
        console.error("Error taking photo:", error);
        alert("Failed to take photo. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const submitEnrollment = async () => {
    if (!studentName.trim()) {
      alert("Nama/NIM tidak boleh kosong.");
      return;
    }
    setModalVisible(false);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", {
      uri: photoUri,
      name: "enroll_face.jpg",
      type: "image/jpeg",
    } as any);

    formData.append("nim", studentNim);
    formData.append("name", studentName);

    try {
      const response = await fetch("http://10.36.14.6:8000/enroll", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      if (response.ok) {
        alert(`Enrollment successful. ${result.messege}`);
      } else {
        alert(`Enrollment failed: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Enrollment failed. not connected to server.");
    } finally {
      setIsProcessing(false);
      setStudentName("");
      setStudentNim("");
      setPhotoUri(null);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.cameraContainer} facing="front" ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.faceGuide} />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.shutterButton,
                isProcessing && styles.shutterButtonDisabled,
              ]}
              onPress={takePicture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Add Mahasiswa</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* MODAL */}

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Masukkan Identitas</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Aldyansyah"
              value={studentName}
              onChangeText={setStudentName}
            />
            <TextInput
              style={styles.input}
              placeholder="Contoh: 2702320892"
              value={studentNim}
              onChangeText={setStudentNim}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={submitEnrollment}
              >
                <Text style={styles.submitText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  //PAGE
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  stepContainer: {
    alignItems: "center",
    paddingHorizontal: 25,
    marginTop: 58,
    marginBottom: 8,
  },

  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },

  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
  },

  //CAMERA
  cameraContainer: {
    flex: 1,
  },

  faceGuide: {
    width: 250,
    height: 300,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    borderStyle: "dashed",
    marginTop: 150,
  },

  shutterButton: {
    backgroundColor: "#00529C", // Warna biru korporat/kampus
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5, // Shadow untuk Android
  },

  shutterButtonDisabled: {
    backgroundColor: "#A9A9A9", // Warna abu-abu saat tombol dinonaktifkan
  },

  defaultText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 15,
  },

  buttonContainer: {
    width: "100%",
    marginHorizontal: 16,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins_400Regular",
  },

  //Modal

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 15,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  cancelBtn: {
    padding: 10,
  },

  cancelText: {
    color: "red",
    fontWeight: "bold",
  },

  submitBtn: {
    backgroundColor: "#00529C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  submitText: {
    color: "white",
    fontWeight: "bold",
  },
});
