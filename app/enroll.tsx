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

  const [isResultModalVisible, setResultModalVisible] = useState(false);
  const [resultStatus, setResultStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [resultMessage, setResultMessage] = useState("");

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
          quality: 0.3,
          base64: false,
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

      if (result.status === "success") {
        setResultStatus("success");
        setResultMessage(`Data mahasiswa ${studentName} berhasil tersimpan`);
      } else {
        setResultStatus("error");
        setResultMessage(result.message || "Gagal menyimpan data.");
      }

      setResultModalVisible(true);
    } catch (error) {
      console.error(error);
      setResultStatus("error");
      setResultMessage("Not connected to th server. check your connection");
      setResultModalVisible(true);
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

      {/* MODAL INPUT */}

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

      {/* 2. MODAL HASIL ENROLLMENT (SUKSES/GAGAL) */}
      <Modal
        visible={isResultModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultContent}>
            <Text style={styles.resultIcon}>
              {resultStatus === "success" ? "✅" : "❌"}
            </Text>
            <Text
              style={[
                styles.resultTitle,
                resultStatus === "error" && { color: "#D32F2F" },
              ]}
            >
              {resultStatus === "success"
                ? "Pendaftaran Berhasil!"
                : "Pendaftaran Gagal"}
            </Text>
            <Text style={styles.resultMessage}>{resultMessage}</Text>

            <TouchableOpacity
              style={[
                styles.okBtn,
                resultStatus === "error" && { backgroundColor: "#D32F2F" },
              ]}
              onPress={() => setResultModalVisible(false)}
            >
              <Text style={styles.okBtnText}>Tutup</Text>
            </TouchableOpacity>
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

  //Modal Input

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

  //Modal Result
  resultContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "85%",
    elevation: 10,
  },

  resultIcon: {
    fontSize: 50,
    marginBottom: 10,
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
    textAlign: "center",
  },

  resultMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 22,
  },

  okBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  okBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
