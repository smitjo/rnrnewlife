import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            WebView(urlString: "https://rnrnewlife.com")
                .ignoresSafeArea()

            VStack {
                HStack {
                    Text("RNR New Life")
                        .font(.headline)
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding()
                .background(Color.blue.opacity(0.8))

                Spacer()
            }
        }
    }
}

#Preview {
    ContentView()
}
