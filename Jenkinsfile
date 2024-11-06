pipeline {
    agent any

    tools {
        jdk 'jdk17' // Ensures Java 17 is used
        maven 'maven3'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKER_IMAGE = 'saidiwissem/app:latest'
    }

    stages {
        stage('Git Checkout') {
            steps {
                script {
                    echo "Checking out the main branch from Git"
                    git(
                        branch: 'main', 
                        credentialsId: 'git-cred',
                        url: 'https://github.com/wissem-saidi/app.git'
                    )
                }
            }
        }

        stage('File System Scan') {
            steps {
                script {
                    echo "Scanning the file system with Trivy"
                    sh "trivy fs --format table -o trivy-report.html ."
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    echo "Running SonarQube analysis with Java 17"
                    withSonarQubeEnv('sonar') {
                        sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectName=app \
                        -Dsonar.projectKey=app \
                        -Dsonar.java.binaries=extracted-war/WEB-INF/classes \
                        -Dsonar.sources=extracted-war/WEB-INF/classes \
                        -Dsonar.sourceEncoding=UTF-8
                        """
                    }
                }
            }
        }

        stage('Build & Tag Docker Image') {
            steps {
                script {
                    echo "Building Docker image"
                    withDockerRegistry(credentialsId: 'docker-cred') {
                        sh "docker build -t ${DOCKER_IMAGE} ."
                    }
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    echo "Pushing Docker image to registry"
                    withDockerRegistry(credentialsId: 'docker-cred') {
                        sh "docker push ${DOCKER_IMAGE}"
                    }
                }
            }
        }

        stage('Deploy To Kubernetes') {
            steps {
                script {
                    withKubeConfig(
                        credentialsId: 'k8-cred', 
                        namespace: 'webapps', 
                        serverUrl: 'https://192.168.1.90:6443'
                    ) {
                        sh "kubectl create namespace webapps || echo 'Namespace webapps already exists'"
                        sh "kubectl apply -f deployment-service.yaml -n webapps"
                    }
                }
            }
        }

        stage('Verify the Deployment') {
            steps {
                script {
                    withKubeConfig(
                        credentialsId: 'k8-cred', 
                        namespace: 'webapps', 
                        serverUrl: 'https://192.168.1.90:6443'
                    ) {
                        sh "kubectl get pods -n webapps"
                        sh "kubectl get svc -n webapps"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                def jobName = env.JOB_NAME
                def buildNumber = env.BUILD_NUMBER
                def pipelineStatus = currentBuild.result ?: 'SUCCESS' // Default to SUCCESS if null
                def bannerColor = pipelineStatus.toUpperCase() == 'SUCCESS' ? 'green' : 'red'

                def body = """
                    <html>
                    <body>
                    <div style="border: 4px solid ${bannerColor}; padding: 10px;">
                    <h2>${jobName} - Build ${buildNumber}</h2>
                    <div style="background-color: ${bannerColor}; padding: 10px;">
                    <h3 style="color: white;">Pipeline Status: ${pipelineStatus.toUpperCase()}</h3>
                    </div>
                    <p>Check the <a href="${env.BUILD_URL}">console output</a>.</p>
                    </div>
                    </body>
                    </html>
                """

                def attachments = []
                if (fileExists('trivy-report.html')) {
                    attachments.add('trivy-report.html')
                }
                if (fileExists('trivy-image-report.json')) {
                    attachments.add('trivy-image-report.json')
                }

                emailext(
                    subject: "${jobName} - Build ${buildNumber} - ${pipelineStatus.toUpperCase()}",
                    body: body,
                    to: 'minomina206@gmail.com',
                    from: 'jenkins@example.com',
                    replyTo: 'jenkins@example.com',
                    mimeType: 'text/html',
                    attachmentsPattern: attachments.join(',')
                )
            }
        }
    }
}
