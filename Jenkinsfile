pipeline {
    agent any
    
    tools {
        jdk 'jdk17'
        maven 'maven3'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }

    stages {
        stage('Git Checkout') {
            steps {
                script {
                    // Increase Git buffer size
                    sh "git config --global http.postBuffer 524288000" // Set buffer size to 500 MB

                    // Retry logic for Git checkout
                    retry(3) {
                        timeout(time: 10, unit: 'MINUTES') {
                            git branch: 'main', credentialsId: 'git-cred', url: 'https://github.com/wissem-saidi/app.git', depth: 1
                        }
                    }
                }
            }
        }
        
        stage('File System Scan') {
            steps {
                script {
                    echo "Scanning the file system with Trivy"
                    sh "trivy fs --format table -o trivy-fs-report.html ."
                }
            }
        }
        
       
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    echo "Running SonarQube analysis on the extracted WAR"
                    dir('extracted-war') {
                        withSonarQubeEnv('sonar') {
                            sh '''
                            $SCANNER_HOME/bin/sonar-scanner \
                            -Dsonar.projectName=app \
                            -Dsonar.projectKey=app \
                            -Dsonar.java.binaries=WEB-INF/classes \
                            -Dsonar.sources=WEB-INF/classes \
                            -Dsonar.sourceEncoding=UTF-8
                            '''
                        }
                    }
                }
            }
        }
        stage('Publish To Nexus') {
            steps {
                withMaven(globalMavenSettingsConfig: 'global-settings', jdk: 'jdk17', maven: 'maven3', mavenSettingsConfig: '', traceability: true) {
                    sh "mvn deploy -DaltDeploymentRepository=nexus-cred::http://192.168.1.100:8081/repository/maven-releases/"
                }
            }
        }
        stage('Build & Tag Docker Image') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                        // Build the Docker image
                        sh """
                        docker build -t saidiwissem/app:latest .
                        """  
                    }
                }
            }
        }
        
        stage('Docker Image Scan') {
            steps {
                script {
                    sh "trivy image --format json -o trivy-image-report.json saidiwissem/app:latest"
                }
            }
        }
        
        stage('Push Docker Image') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                        sh "docker push saidiwissem/app:latest"
                    }
                }
            }
        }
        
        stage('Deploy To Kubernetes') {
            steps {
                script {
                    withKubeConfig(caCertificate: '', clusterName: 'kubernetes', contextName: '', credentialsId: 'k8-cred', namespace: 'webapps', restrictKubeConfigAccess: false, serverUrl: 'https://192.168.1.90:6443') {
                        sh "kubectl apply -f deployment-service.yaml -n webapps"
                    }
                }
            }
        }
        
        stage('Verify the Deployment') {
            steps {
                script {
                    withKubeConfig(caCertificate: '', clusterName: 'kubernetes', contextName: '', credentialsId: 'k8-cred', namespace: 'webapps', restrictKubeConfigAccess: false, serverUrl: 'https://192.168.1.90:6443') {
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
                def pipelineStatus = currentBuild.result ?: 'SUCCESS'
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

                emailext (
                    subject: "${jobName} - Build ${buildNumber} - ${pipelineStatus.toUpperCase()}",
                    body: body,
                    to: 'scrpngldn6@gmail.com',
                    from: 'jenkins@example.com',
                    replyTo: 'jenkins@example.com',
                    mimeType: 'text/html',
                    attachmentsPattern: 'trivy-fs-report.html,trivy-image-report.json'
                )
            }
        }
    }
}
